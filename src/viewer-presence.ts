/* eslint-disable no-await-in-loop */
import {
	IDataForBuildRegister,
	IDataForCoreLogic,
	IPreBuildArr,
	IResultsByType,
	IViewerPresence,
} from './interfaces/i-viewer-presence';
import { PresencesLogRepository, ViewerPresencesRepository, ViewerRepository } from './database/repositories';
import { constants } from './constants';
import fs from 'fs';
import moment from 'moment';

export class ViewershipPresencesGenerator implements IViewerPresence {
	private readonly viewershipRepository: ViewerRepository;
	private readonly logPresencesRepository: PresencesLogRepository;
	private readonly viewerPresenceRepository: ViewerPresencesRepository;

	constructor(
		viewershipRepository: ViewerRepository,
		logPresencesRepository: PresencesLogRepository,
		viewerPresenceRepository: ViewerPresencesRepository,
	) {
		this.viewerPresenceRepository = viewerPresenceRepository;
		this.viewershipRepository = viewershipRepository;
		this.logPresencesRepository = logPresencesRepository;
	}

	/**
	 * Generates and processes viewership data.
	 *
	 * This function retrieves viewership content and presence logs, and processes them by grouping and ordering.
	 * It then builds the result by iterating through each content and calculating the overlapping logs.
	 * Finally, it invokes buildAndStore to finalize the construction of the record and store it.
	 *
	 * @returns {Promise<void>} A promise that resolves when the processing is complete.
	 */
	async generate(): Promise<void> {
		try {
			/***** Get viewer contents and presences logs registers  *****/
			const viewershipContents = await this.viewershipRepository.getAll();
			const presenceLogs = await this.logPresencesRepository.getAll();

			const resultsByType = {};

			/***** Order contents by date *****/
			const orderContents = viewershipContents.sort((a, b) => moment(a.start).diff(moment(b.start)));

			/***** Group presenceLogs by type *****/
			const groupedLogsByType = presenceLogs.reduce((groups, log) => {
				if (!groups[log.type]) {
					groups[log.type] = [];
				}
				groups[log.type].push(log);
				return groups;
			}, {});

			/***** Build process by each content *****/
			for (const content of orderContents) {
				/***** Only two loops beacon - mobile *****/
				for (const type in groupedLogsByType) {
					/***** Get only logs that match the date of the content *****/
					const overlappingLogs = presenceLogs.filter(
						(log) => log.timestamp >= content.start && log.timestamp < content.end && log.type === type,
					);

					const dates = overlappingLogs
						.map((register) => register.timestamp)
						.sort((a, b) => moment(a).diff(moment(b)));

					/***** Get register from core logic *****/
					const dataForCoreLogic: IDataForCoreLogic = { content, dates, overlappingLogs };
					const register = await this.coreLogic(dataForCoreLogic);

					if (!resultsByType[type]) {
						resultsByType[type] = [];
					}
					if (register.length > 0) {
						resultsByType[type].push(register);
					}
				}
			}

			/***** Finalize the construction of the record and store it *****/
			this.buildAndStore(resultsByType);
		} catch (error) {
			throw error;
		}
	}

	/**
	 * Core logic to process the input data and build a response.
	 *
	 * This function takes in data for processing, iterates through the dates, and computes time in seconds
	 * and minutes for each record. The result is then built into a structured response.
	 *
	 * @param {any} dataForLogic - The input data containing content, dates, and overlapping logs.
	 * @returns {Promise<any>} A promise that resolves with the structured response data.
	 */
	async coreLogic(dataForLogic: any): Promise<IPreBuildArr[]> {
		try {
			const { content, dates, overlappingLogs } = dataForLogic;
			let firstTime = false;
			let indexTemp = 0;
			const preBuildArr = [];

			for (let index = 0; index < dates.length; index++) {
				let start = moment(dates[index]);
				const end = moment(dates[index + 1]);

				/***** Declare constants for conditional *****/
				const diffTime = end.diff(start, 'milliseconds') / 1000;
				const isFirstOrLastIndex = index === 0 || index === dates.length - 1;
				const isDiffTimeValid = ![13, 14, 15].includes(diffTime);

				if (isFirstOrLastIndex || isDiffTimeValid) {
					const datePart = dates.slice(indexTemp, index + 1);
					let totalSeconds = 0;

					/***** Calculate total timeSeconds by datePart registers *****/
					for (let i = 1; i < datePart.length; i++) {
						if (!firstTime) {
							start = moment(content.start);
						} else {
							start = moment(datePart[i - 1]);
						}
						const end = moment(datePart[i]);
						totalSeconds += end.diff(start, 'milliseconds') / 1000;
						firstTime = true;
					}

					/***** Calculate time in seconds and minutes for each register ******/
					const timeInSeconds =
						index === dates.length - 1
							? totalSeconds + constants.refreshTime
							: totalSeconds + constants.refreshTime + constants.spaceBetweenLogs;
					const timeInMinutes = timeInSeconds / 60;

					/***** Build register response  ******/
					const dataForCoreLogic: IDataForBuildRegister = {
						content,
						dates,
						index,
						overlappingLogs,
						timeInMinutes,
						timeInSeconds,
					};
					this.buildRegister(dataForCoreLogic, preBuildArr);

					indexTemp = index + 1;
				}
			}
			return preBuildArr;
		} catch (error) {
			throw error;
		}
	}

	/**
	 * Constructs a record from the provided data and adds it to an array of records.
	 * @param {any} buildData - Data needed to construct the record.
	 * @param {any} preBuildArr - Array of previous records where the new record will be added.
	 * @returns {Promise<any>} - Returns a promise with the updated array of records.
	 **/
	buildRegister(buildData: IDataForBuildRegister, preBuildArr: IPreBuildArr[]): void {
		const { content, dates, index, overlappingLogs, timeInMinutes, timeInSeconds } = buildData;

		try {
			/***** Build a granular input based on the data provided. *****/
			const granularEntry = {
				start: index === 0 ? moment(content.start).toISOString() : dates[index + 1],
				end: moment(dates[index]).add(20, 'seconds').toISOString(),
				contentId: content['_id'].toString(),
				timeInSeconds: timeInSeconds,
				type: overlappingLogs[index].type,
				timeInMinutes: timeInMinutes,
			};

			if (dates[index + 1]) {
				/***** Build a new entry with detailed information *****/
				const entry = {
					start: index === 0 ? moment(content.start).toISOString() : dates[index + 1],
					end: moment(dates[index]).add(20, 'seconds').toISOString(),
					contentId: content['_id'].toString(),
					timeInSeconds: timeInSeconds,
					type: overlappingLogs[index].type,
					timeInMinutes: timeInMinutes,
					panelistId: overlappingLogs[index].panelistId.toString(),
					contentType: content['contentType'],
					viewingSource: content['viewingSource'],
					controlNumber: Math.floor(Math.random() * 2) + 1,
					mediaSourceId: content['mediaSource'].id.toString(),
					providerId: content['mediaSource'].provider.id.toString(),
					granular: index === 0 ? [granularEntry] : [],
				};

				const currentIndex = preBuildArr.length - 1;

				/***** If there is more than one entry, update the time seconds and minutes of the penultimate entry *****/
				if (currentIndex > 0) {
					preBuildArr[currentIndex].granular.push(granularEntry);
					preBuildArr[currentIndex].end = entry.end;
				}
				preBuildArr.push(entry);
			}

			/*****
			 * If its the last date and there is more than one entry,
			 * make final adjustments to the time properties and add the last granular entry
			 *****/
			if (preBuildArr.length > 1) {
				preBuildArr[preBuildArr.length - 2].timeInSeconds = timeInSeconds;
				preBuildArr[preBuildArr.length - 2].granular[0].timeInSeconds = timeInSeconds;
				preBuildArr[preBuildArr.length - 2].timeInMinutes = timeInSeconds / 60;
				preBuildArr[preBuildArr.length - 2].granular[0].timeInMinutes = timeInSeconds / 60;
			}
			if (index === dates.length - 1 && preBuildArr.length > 1) {
				preBuildArr[preBuildArr.length - 1].granular.push(granularEntry);
				preBuildArr[preBuildArr.length - 1].end = moment.utc(content.end).toISOString();

				const tempMinutes = preBuildArr[preBuildArr.length - 1].timeInMinutes;
				preBuildArr[preBuildArr.length - 1].timeInMinutes =
					preBuildArr[preBuildArr.length - 2].timeInMinutes;
				preBuildArr[preBuildArr.length - 2].granular[0].timeInMinutes = tempMinutes;
				preBuildArr[preBuildArr.length - 2].timeInMinutes = tempMinutes;

				const tempSeconds = preBuildArr[preBuildArr.length - 1].timeInSeconds;
				preBuildArr[preBuildArr.length - 1].timeInSeconds =
					preBuildArr[preBuildArr.length - 2].timeInSeconds;
				preBuildArr[preBuildArr.length - 2].granular[0].timeInSeconds = tempSeconds;
				preBuildArr[preBuildArr.length - 2].timeInSeconds = tempSeconds;
			}
		} catch (error) {
			throw error;
		}
	}

	/**
	 * Asynchronously builds and stores data.
	 *
	 * @param {any} resultsByType - The input data categorized by type.
	 */
	async buildAndStore(resultsByType: IResultsByType): Promise<void> {
		const finalBuild = [];
		const indexFlat = 0;
		const resultsByTypeValues = Object.values(resultsByType);

		try {
			/***** Flatten the values and add them to the finalBuild array *****/
			resultsByTypeValues.forEach((obj) => {
				const flattenedObject = Object.values(obj).flatMap((value) =>
					Array.isArray(value) ? value : [value],
				);
				finalBuild.push(flattenedObject);
			});

			finalBuild[indexFlat + 1].forEach((item1) => {
				const item1StartDate = new Date(item1.start);

				finalBuild[indexFlat].forEach((item2) => {
					const item2StartDate = new Date(item2.start);
					const item2EndDate = new Date(item2.end);

					if (item1StartDate >= item2StartDate && item1StartDate <= item2EndDate) {
						delete item1.granular;
						item2.granular.push(item1);
					}
				});
			});

			const itemForCreate = {
				timestamp: '2023-05-19T00:00:00.000Z',
				metadata: {
					presences: finalBuild[0],
				},
				createdAt: moment().toISOString(),
				updatedAt: moment().toISOString(),
			};

			/***** Generate final response in json file ./output.json */
			const finalResponse = JSON.stringify(itemForCreate, null, 2);
			fs.writeFile('output.json', finalResponse, 'utf8', (err) => {
				if (err) {
					console.log('An error occurred while writing JSON Object to File.');
					return console.log(err);
				}
				console.log(
					`${constants.colors.blueColor} ---> JSON file has been saved! ${constants.colors.reset}`,
				);
			});

			/***** Store final object to mongo collection *****/
			await this.viewerPresenceRepository.create(itemForCreate);
			console.log(
				`${constants.colors.greenColor} ---> Store data in mongo successfully! ${constants.colors.reset}`,
			);
		} catch (error) {
			throw error;
		}
	}
}
