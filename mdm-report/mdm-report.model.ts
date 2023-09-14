import { ReactNode } from "react";
import { ISessionProps } from "../../types";

export interface IMDMReportProps extends ISessionProps { }

export interface IAddData {
    id: number;
    name: string;
    report_timezone: string;
    report_period: string;
    period_value: string;
    execution_cron: string;
    from_participant: string;
    registered_participant: string;
    output_container: string;
    description: string;
    data_substitution_type: string;
    is_mdm_status_mapping: boolean;
    meter_serial: string;
    meter_serial_custom_value: string;
    is_notification_on: boolean;
    get_notification: string;
    recipient_emails: string[];
    user_emails: string[];
}

export interface IGridProps {
    editData: (id: number, value: string) => Promise<void>; // Changed & now Working
}


export interface IUpsertViewProps {
    upsertValue: string;
    id: number;
    upsertToggle: () => void;       // Changed and now working
    data: IMDMData;
}

export interface IMDMData {
    name: string;
    report_timezone: string;
    report_period: string;
    period_value: string;
    execution_cron: string;
    from_participant: string;
    registered_participant: string;
    output_container: string;
    description: string;
    data_substitution_type: string;
    meter_serial: string;
    meter_serial_custom_value: string;
    is_notification_on: boolean;
    get_notification: string;
    recipient_emails: string[];
    user_emails: string[];
}

export interface ISubmitMDMData {
    name: string; 
    report_timezone: string;
    report_period: string; 
    period_value: string; 
    execution_cron: string; 
    from_participant: string; 
    registered_participant: string; 
    output_container: string; 
    description: string; 
    data_substitution_type: string; 
    meter_serial: string; 
    meter_serial_custom_value: string; 
    is_notification_on: boolean; 
    get_notification: string; 
    recipient_emails: string[]; 
    selected_recipient_emails: ISelectOption[]; 
    user_emails: ISelectOption[]; 
}

export interface IMDMGridData {
    id: number;
    value: string;
    description: string;
    total_length: number;
    flag?: boolean;
}

export interface IMDMReportMeterDataTableProps {
    id: number,
    isViewMode: () => boolean;
    navigate?: (path: string, options: NavigationOptions) => void;    // Changed and now works
    upsertValue: string;
}

interface NavigationOptions {
    state: {
        referrer: string;
        recordId: number;
        id: number;
        upsertValue: string;
    };
}

export interface IMeterSearchParams {
    meter_property_number: string;
    meter_serial_number: string;
    meter_name: string;
    nmi: string;
    property_name: string;
    customer_name: string;
}

export interface IMDMReportMeterDataTableGridData {
    id: number;
    meter_id: string;
    meter_serial_number: string;
    meter_property_number: string;
    nmi: string;
    name: string;
    total_length: number;
    customer_name: string;
    active: boolean;
    flag?: boolean;
}

export interface IMDMReportMeterGroupDataTableProps {
    id: number,
    isViewMode: () => boolean;
    navigate?: (path: string, options: NavigationOptions) => void;    // Changed and now works
    upsertValue: string;
}
export interface ISelectOption {
    label: string;
    value: string;
}

export interface IMDMReportStatusModalProps {
    isOpen: boolean;
    toggleCloseModal: () => void;           // Chnaged and now works
    toggleSubmitModal: () => void;          // Chnaged and now works
    ids: number[];
    isAll: boolean;
    name: string;
    getReports: () => Promise<void>;        // Chnaged and now works
}

export interface IExportProps {
    id: number,
    mdmDataStreamIdentifiers?: ISelectOption[];
    registerIds?: ISelectOption[];
    isViewMode: () => boolean;
}

export interface IExportGridData {
    id: number;
    record_identifier: string;
    value_type: string;
    raw_meter_channels: string;
    channels: IChannels[];
    retailer_service_order: string;
    transaction_code: string;
}
export interface IChannelList {
    name: string;
    type: string;
    quantity_type: { type: string, abbreviation: string }     // Chnaged and now working
    unit_of_measurement: string;
    equivalent_300_channel?: string;
    mdm_data_stream_identifier?: string;
    register_id?: string;
}

export interface IChannels {
    channel_name: string;
    quantity_type: string;
    unit_of_measurement: string;
    equivalent_300_channel?: string;
    mdm_data_stream_identifier?: string;
    register_id?: string;
    uomList?: IUomData[];
}

interface Channel {
    channel_name: string;
}

export interface IRecordDataType {
    channels: Channel[];
}

export interface IUomData {
    name: string;
    abbreviation: string;
    type: string;
}

export interface IExecuteParam {
    from_date: string;
    to_date: string;
    execution_id: number;
}

export interface IMappingData {
    id: number;
    metrix_status: string;
    quality_flag: string;
    reason_code: string;
    text_description?: string;
    flag?: boolean;
}

export interface IQualityFlags {
    id: number;
    quality_flag: string;
    description: string;
    text: string;
}

export interface IReasonCodes {
    id: number;
    reason_code: string;
    description: string;
    text: string;
}

export interface IMetrixStatus {
    id: number;
    value: string;
    description: string;
    text: string;
}

export interface IErrorType {
    execute_from_date: string,
    execute_to_date: string
}

export interface IGridDataType {
    meter_id: number;
    text_description: string;
    actual_reason_description: string;
    quality_flag_description: string;
    reason_code: string;
    quality_flag: string;
    metrix_status: string;
    id: number,
    flag: boolean,
    total_length: number,
}

export interface ITransactionCodesType {
    action: string;
    code: string;
}
