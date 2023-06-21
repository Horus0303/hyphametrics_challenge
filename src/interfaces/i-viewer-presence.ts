import { ObjectId } from 'mongodb';

export interface IViewerPresence {
	generate(): Promise<void>;
}

export interface IGranularEntry {
	start: string;
	end: string;
	contentId: string;
	timeInSeconds: number;
	type: string;
	timeInMinutes: number;
}

export interface IPreBuildArr extends IGranularEntry {
	panelistId?: string;
	contentType?: string;
	viewingSource?: string;
	controlNumber?: number;
	mediaSourceId?: string;
	providerId?: string;
	granular?: IGranularEntry[];
}

export interface IViewershipContent {
	_id: ObjectId;
	timestamp: Date;
	metadata: {
		_id: ObjectId;
		contents: IContent;
		crossRules: any[];
		coreMeterId: string;
		householdId: string;
		timestamp: Date;
		createdAt: Date;
		updatedAt: Date;
	};
	__v: number;
}

export interface IContent {
	viewingSource: string;
	contentType: string;
	provider: {
		id: ObjectId;
	};
	model: string;
	language: string;
	start: Date;
	end: Date;
	timeInMinutes: number;
	timeInSeconds: number;
	timeShifted: boolean;
	mediaSource: MediaSource;
	ip: string;
	tv: {
		id: ObjectId;
		name: string;
	};
	tvOnIds: any[];
	presenceIds: string[];
	granularPresenceIds: any[];
	productPlacement: any[];
	adCandidate: boolean;
	status: string;
	_id: ObjectId;
}
export interface IPresencesLog {
	_id: ObjectId;
	timestamp: Date;
	type: string;
	householdId: ObjectId;
	coreMeterId: ObjectId;
	panelistId: ObjectId;
	personalDeviceId: ObjectId;
	__v: number;
}

export interface IDataForCoreLogic {
	content: IContent;
	dates: string[];
	overlappingLogs: IOverlappingLog[];
}
export interface IDataForBuildRegister {
	content: IContent;
	dates: string[];
	index: number;
	timeInMinutes: number;
	timeInSeconds: number;
	overlappingLogs: IOverlappingLog[];
}
export interface IResultsByType {
	[key: string]: IPreBuildArr[];
}
interface IOverlappingLog {
	timestamp: string;
	type: string;
	panelistId?: { toString(): string };
}
type MediaSource = {
	id: ObjectId;
	name: string;
	port: string;
	provider: {
		id: string;
		name: string;
	};
	subProvider: {
		id: string;
		name: string;
	};
	language: string;
};
