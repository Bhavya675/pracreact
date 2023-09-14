import React, { useEffect, useState } from "react";
import { Button, CardBody, CardTitle, Col, FormGroup, Input, InputGroup, Label, Modal, ModalBody, ModalFooter, ModalHeader, Row, Table } from "reactstrap";
import NEM12ReportService from "../../services/nem12-report/nem12-report.service";
import { VALUE_TYPE, getSelect2CSS, API_RESPONSE_CODE, VALUE_LABEL, EXPORT_DATA_ERROR} from '../../utils';
import Select from 'react-select';
import { useSelector } from "react-redux";
import { ExtendedStore } from "../../types";
import { IChannelList, IChannels, IExportGridData, IExportProps, IRecordDataType, ISelectOption, IUomData, ITransactionCodesType } from "./mdm-report.model";
import SweetAlert from "react-bootstrap-sweetalert";
import ConfirmationDialog from "../../components/confirmation-dialog";
import _ from "lodash";
import { ClearIndicator } from "../../components/select-clear-indicator/select-clear-indicator";

const ExportData = (props: IExportProps) => {

    const service = new NEM12ReportService(); // Chnage here
    const customizer = useSelector((state: ExtendedStore) => state.customizer.isDark)

    const [alert, setAlert] = useState<JSX.Element | null>(null);  // Changed & now working
    const [modal, setModal] = useState<boolean>(false);
    const [record_identifier_list, setRecordIdentifierList] = useState<any[]>([]);     
    //const [record_identifier_list, setRecordIdentifierList] = useState<RecordIdentifierListType[]>([]);     // Changed
    const [channelList, setChannelList] = useState<IChannelList[]>([]);
    const [gridData, setGridData] = useState<IExportGridData[]>([]);
    const [error, setError] = useState<any>();
    const [transactionCodes, setTransactionCodes] = useState<ITransactionCodesType[]>([]);
    const [quantityDataList, setQuantityDataList] = useState<string[]>([]);
    const [record300Data, setRecord300Data] =  useState<IRecordDataType>({ channels: [] });  // Changed but test
    const [record500Data, setRecord500Data] = useState<IRecordDataType>({ channels: [] });  // Changed but test
    const [renderConfirm, setRenderConfirm] = useState<boolean>(false);
    const [particularChannel, setParticularChannel] = useState<string>('');
    const [mdmDataStreamIdentifiers, setMdmDataStreamIdentifiers] = useState<ISelectOption[]>([]);
    const [registerIds, setRegisterIds] = useState<ISelectOption[]>([]);

  
    // interface RecordIdentifierListType{
    //     is_disabled: boolean;
    //     transaction_code: string;
    //     channels: never[] | string;
    //     record_identifier: string,
    //     unit_of_measurement: string,
    //     retailer_service_order: string;
    //     value_type: string;
    // }
    const exportDataList = () => {
        let GriData = [...gridData];
        if (GriData.length > 0) {
            return GriData.map((item, index) => {
                return (
                    <tr key={index}>
                        <td>{item.record_identifier}</td>
                        <td>{item.value_type === VALUE_TYPE.USAGE ? VALUE_LABEL.USAGE : item.value_type}</td>
                        <td>{item.channels?.map((x) => (x.channel_name + (x.unit_of_measurement ? " (" + x.unit_of_measurement + ") " : ''))).join(', ')}</td>
                    </tr>
                );
            });
        } else {
            return (
                <tr>
                    <td colSpan={4} width="100" className="text-center">
                        <b>No data found</b>
                    </td>
                </tr>
            );
        }
    };

    const getQuantityNames = async () => {
        const gridData = (await service.GetAllQuantityNames()).data || [];
        setQuantityDataList(gridData)
    };

    const getUOMList = async (quantity_type: string, name: string, index: number) => {
        let gridData: string[] = [];    // Changed & now working
        if (quantity_type) {
            gridData = (await service.GetUomForQuantity(quantity_type)).data || [];
        }
        let Data = record_identifier_list.map((item) => {
            if (item.record_identifier === name) {
                if (!gridData.length) {
                    item.channels[index].unit_of_measurement = "";
                }
                item.channels[index].uomList = gridData;
            }
            return item;
        })
        setRecordIdentifierList(Data);
    };

    const editData = async () => {
        let reportExportEditData = (await service.GetNEM12ReportOutputById(props.id)).data; // Chnage here
        if (!(reportExportEditData.map((x: {record_identifier: string}) => x.record_identifier)).includes("500")) {    //Changed & now works
            reportExportEditData.push({ ...initialSingleDataObject('500'), is_disabled: true, id: 0 });
        }
        
        for (let i = 0; i < reportExportEditData.length; i++) {
            for (let j = 0; j < reportExportEditData[i].channels?.length; j++) {
                if (reportExportEditData[i]?.channels[j]?.quantity_type) {
                    reportExportEditData[i].channels[j].uomList = await GetUomForQuantity(reportExportEditData[i]?.channels[j]?.quantity_type);
                }
                else {
                    reportExportEditData[i].channels[j].unit_of_measurement = ""
                }
            }
        }
        setRecordIdentifierList(reportExportEditData);
        setModal(!modal);
    };

    const GetUomForQuantity = async (quantity_type: string) => {
        let data = (await service.GetUomForQuantity(quantity_type)).data as IUomData[] || [];
        return data;
    }

    const GetMeterChannels = async () => {
        const gridData = (await service.GetMeterChannelsForExportData(props.id)).data || [];
        if (gridData) {
            setChannelList(gridData);
        } else {
            setChannelList([]);
        }
    };

    const GetExportData = async () => {
        const gridData = (await service.GetNEM12ReportOutputList(props.id)).data || []; // Chnage here
        if (gridData && gridData.length) {
            setGridData(gridData)
        } else {
            setGridData([]);
        }
    };

    const initialSingleDataObject = (name: string) => {
        return {
            record_identifier: name,
            value_type: VALUE_TYPE.ACTUAL,
            channels: [],
            retailer_service_order: '',
            transaction_code: '',
            is_disabled: false
        };
    };

    const getNewList = () => {
        return [initialSingleDataObject('300'), initialSingleDataObject('500')];
    };

    const dataToggle = () => {
        const _initialList = getNewList();

        setModal(!modal);
        setRecordIdentifierList(_initialList)
    };

    const handleDataClose = () => {
        setModal(false);
        setError(null);
    }
    const onHandleChange = (value: string, name: string) => {
        let recordIdentifierList = record_identifier_list.map((item) => {
            if (item.record_identifier === name) {
                item.value_type = value;
            }
            return item;
        });
        setRecordIdentifierList(recordIdentifierList);
    };

    const onChannelChange = (value: any, name: string, selectedValue: any) => {
        let channels: IChannels[] = [];
        let difference = selectedValue?.find((x: any) => !value.includes(x));
        let record500 = record_identifier_list.find((i) => i.record_identifier === '500');
        let equivalentList = record500.channels?.map((i: {equivalent_300_channel: string}) => i.equivalent_300_channel);    // Changed & now working
        let ifExist = difference && equivalentList && equivalentList.includes(difference.value);
        if (difference && name === '300' && ifExist) {
            setRenderConfirm(true);
            setParticularChannel(difference.value)
        }
        else {
            value.map(async (t: {value: string, quantity_type: string, unit_of_measurement: string, equivalent_300_channel: string}) => {   // Change & now working
                channels.push({ channel_name: t.value, quantity_type: t.quantity_type, unit_of_measurement: t.unit_of_measurement, equivalent_300_channel: t.equivalent_300_channel });
            }
            );
            let recordIdentifierList = record_identifier_list.map((item) => {
                if (item.record_identifier === name) {
                    item.channels = channels as IChannels[];
                    item.channels.map((x: IChannels, index: number) => {
                        if (x.quantity_type) {
                            getUOMList(x.quantity_type, item.record_identifier, index)
                        }
                    })
                }
                return item;
            });
            let record300Data = recordIdentifierList.find((i) => i.record_identifier === '300');
            setRecord300Data(record300Data)
            setRecordIdentifierList(recordIdentifierList);
        }
    };

    const onTransactionCodeChange = (value: any, name: string) => {
        let recordIdentifierList = record_identifier_list.map((item) => {
            if (item.record_identifier === name) {
                item.transaction_code = value.value
            }
            return item;
        });
        setRecordIdentifierList(recordIdentifierList);
    };

    const onFieldValueChange = (e: React.ChangeEvent<HTMLInputElement>, name: string) => {  // Changed & now working
        let recordIdentifierList = record_identifier_list.map((item) => {
            if (item.record_identifier === name) {
                item.retailer_service_order = e.target.value
            }
            return item;
        });
        setRecordIdentifierList(recordIdentifierList);
    }

    const validateRequiredData = (data: any) => {
        setError(null);
        if (data) {
            const errorList: any = {};
            data.forEach((item: {is_disabled: boolean, channels: IChannels[], record_identifier: string, transaction_code: string }) => {      //Changed but test
                if (!item.is_disabled) {
                    const fieldError: any = {};
                    if (item.channels.length <= 0) {
                        fieldError[`channel_name`] = EXPORT_DATA_ERROR.CHANNEL_NAME;
                    }
                    if (item.record_identifier === "500" && !item.transaction_code) {
                        fieldError[`transaction_code`] = EXPORT_DATA_ERROR.TRANSACTION_CODE;
                    }
                    if (item.channels && item.channels.length && item.record_identifier === "500") {
                        item.channels.forEach((i: IChannels) => {
                            const particularFieldError: any = {};
                            if (!i.equivalent_300_channel) {
                                particularFieldError[`equivalent_300_channel`] = EXPORT_DATA_ERROR.EQUIVALENT_300;
                            }
                            if (particularFieldError && Object.keys(particularFieldError).length) {
                                fieldError[i.channel_name] = particularFieldError;
                            }
                        });
                    }
                    if (fieldError && Object.keys(fieldError).length) {
                        errorList[item.record_identifier] = fieldError;
                    }
                }
            });
            return errorList;
        }
    };

    const handleDataConfirm = async () => {
        const error = validateRequiredData(record_identifier_list);
        if (error && Object.keys(error).length) {
            setError(error)
            return false;
        }
        let list = record_identifier_list.filter(x => !x.is_disabled);
        list = list.map((item) => {
            delete item.raw_meter_channels;
            delete item.is_disabled;
            item.channels.map((x: any) => { delete x.uomList })
            return item;
        });
        const addParam = {
            data: list,
        };
        let response: any = null;

        if (gridData.length > 0) {
            response = await service.UpdateNEM12ReportOutput(props.id, addParam);
        } else {
            response = await service.SaveNEM12ReportOutput(props.id, addParam);
        }
        if (response && response.code && response.code === API_RESPONSE_CODE.SUCCESS) {
            setAlert(
                <div>
                    <SweetAlert
                        success
                        title={response.messages}
                        onConfirm={() => {
                            hideAlert();
                            dataToggle();
                            GetExportData();
                        }}
                    />
                </div>
            )
        } else {
            setAlert(
                <div>
                    <SweetAlert
                        error
                        title={response.messages}
                        onConfirm={() => {
                            hideAlert();
                            dataToggle();
                            GetExportData();
                        }}
                    />
                </div>
            )
        }
    };

    const hideAlert = () => {
        setAlert(null);
    }

    const GetTransactionCode = async () => {
        const res = (await service.GetTransactionCodes()).data
        if (res && res.length) {
            setTransactionCodes(res);
        }
        else {
            setTransactionCodes([]);
        }
    }

    const onQuantityTypeChange = (e: React.ChangeEvent<HTMLInputElement>, name: string, index: number) => {     //Changed & now working
        let Data = record_identifier_list.map((item) => {
            if (item.record_identifier === name) {
                item.channels[index].quantity_type = e.target.value;
            }
            return item;
        })
        setRecordIdentifierList(Data);
        getUOMList(e.target.value, name, index);
    }

    const onDropdownChange = (e: React.ChangeEvent<HTMLInputElement>, name: string, index: number) => {
        let field = e.target.name;
        let Data = record_identifier_list.map((item) => {
            if (item.record_identifier === name) {
                item.channels[index][field] = e.target.value;
            }
            return item;
        })
        setRecordIdentifierList(Data);
    }

    const onEquivalentChannelChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
        let Data = _.cloneDeep(record_identifier_list);
        Data = Data.map((item) => {
            if (item.record_identifier === '500') {
                const list: string[] = [];      // Changed but test
                for (let i = 0; i < item.channels.length; i++) {
                    if (item.channels[i].equivalent_300_channel) {
                        list.push(item.channels[i].equivalent_300_channel);
                    }
                }
                if (list?.includes(e.target.value)) {
                    setAlert(
                        <div>
                            <SweetAlert
                                title={`${e.target.value} is already selected.`}
                                onConfirm={() => hideAlert()}
                                customClass="custom-sweet-alert-width-35em"
                                focusCancelBtn={false}
                                focusConfirmBtn={false}
                                style={{ fontSize: '12px' }}
                                confirmBtnText="Ok"
                                confirmBtnBsStyle="info"
                            />
                        </div>
                    )
                }
                else {
                    item.channels[index].equivalent_300_channel = e.target.value ?? '';
                }
            }
            return item;
        });
        setRecordIdentifierList(Data);
    }

    const getLabelvalue = (value: string) => {
        for (let item of record_identifier_list) {
            if (item.record_identifier === '500' && item.channels && item.channels.length > 0) {
                for (let i of item.channels) {
                    if (i.equivalent_300_channel == value) {
                        return i.channel_name
                    }
                }
            }
        }
        return '';
    }

    const onYesClick = () => {
        let Data = record_identifier_list.map((item) => {
            if (item.record_identifier === '300') {
                item.channels = item.channels?.filter((obj: {channel_name: string}) => {    // Changed & now working
                    return obj.channel_name !== particularChannel;
                });
            }
            if (item.record_identifier === '500') {
                for (let i = 0; i < item.channels.length; i++) {
                    if (item.channels[i].equivalent_300_channel == particularChannel) {
                        item.channels[i].equivalent_300_channel = ''
                    }
                }
            }
            return item;
        })
        let record300Data = Data.find((i) => i.record_identifier === '300');
        setRecord300Data(record300Data)
        hideRenderAlert();
        setRecordIdentifierList(Data);
    }

    const getCurrentErrorList = (value: string) => {
        const tabError = error ? error[value] : {};
        return tabError;
    };

    const getList = (item: { channels: IChannels[]; record_identifier: string; }) => {
        if (item.channels && item.channels.length > 0) {
            const tabError = getCurrentErrorList(item.record_identifier);
            return item.channels?.map((c: IChannels, index: number) => {
                let is300 = item.record_identifier === '300';
                let label = getLabelvalue(c.channel_name);
                return (
                    <tr key={index}>
                        <td>{c.channel_name}</td>
                        {is300 && (
                            <>
                                <td>
                                    <InputGroup>
                                        <Input
                                            type="select"
                                            className="form-select"
                                            name='mdm_data_stream_identifier'
                                            value={c.mdm_data_stream_identifier}
                                            onChange={(e) => onDropdownChange(e, item.record_identifier, index)}
                                        >
                                            <option value={''}>None</option>
                                            {mdmDataStreamIdentifiers.map((data) => (
                                                <option key={data.value} value={data.value}>{data.label}</option>
                                            ))}
                                        </Input>
                                    </InputGroup>
                                </td>
                                <td>
                                    <InputGroup>
                                        <Input
                                            type="select"
                                            className="form-select"
                                            name='register_id'
                                            value={c.register_id}
                                            onChange={(e) => onDropdownChange(e, item.record_identifier, index)}
                                        >
                                            <option value={''}>None</option>
                                            {registerIds.map((data) => (
                                                <option key={data.value} value={data.value}>{data.label}</option>
                                            ))}
                                        </Input>
                                    </InputGroup>
                                </td>
                            </>
                        )}
                        <td>
                            <InputGroup>
                                <Input
                                    type="select"
                                    className="form-select"
                                    value={c.quantity_type}
                                    onChange={(e) => onQuantityTypeChange(e, item.record_identifier, index)}
                                >
                                    <option value={''}>Select Quantity Type</option>
                                    {quantityDataList?.map((data: string) => (
                                        <option key={data} value={data}>{data}</option>
                                    ))}
                                </Input>
                            </InputGroup>
                        </td>
                        <td>
                            <InputGroup>
                                <Input
                                    type="select"
                                    className="form-select"
                                    name='unit_of_measurement'
                                    value={c.unit_of_measurement}
                                    onChange={(e) => onDropdownChange(e, item.record_identifier, index)}
                                >
                                    <option value={''}>Select Unit Of Measurement</option>
                                    {c.uomList?.map((data: IUomData) => (
                                        <option key={data.abbreviation} value={data.abbreviation}>
                                            {data.name} - ({data.type}/{data.abbreviation})
                                        </option>
                                    ))}
                                </Input>
                            </InputGroup></td>
                        <td>
                            {item.record_identifier === '300'
                                ?
                                label
                                :
                                <>
                                    <InputGroup>
                                        <Input
                                            type="select"
                                            className="form-select"
                                            value={c.equivalent_300_channel ?? ''}
                                            onChange={(e) => onEquivalentChannelChange(e, index)}
                                        >
                                            <option value={''}>Select channel</option>
                                            {record300Data && record300Data.channels?.map((data: {channel_name: string}) => (
                                                <option key={data.channel_name} value={data.channel_name}>
                                                    {data.channel_name}
                                                </option>
                                            ))}
                                        </Input>
                                    </InputGroup>
                                    {tabError && tabError[c.channel_name]?.equivalent_300_channel ? (
                                        <div className="text-danger">
                                            {tabError[c.channel_name]?.equivalent_300_channel}
                                        </div>
                                    ) : null}
                                </>
                            }
                        </td>

                    </tr>
                )
            })
        }
        else {
            return null
        }
    }

    const getIndividualRecordData = () => {
        let record300Data = record_identifier_list.find((i) => i.record_identifier === '300');
        let record500Data = record_identifier_list.find((i) => i.record_identifier === '500');
        setRecord300Data(record300Data)
        setRecord500Data(record500Data)
    }

    const hideRenderAlert = () => {
        setRenderConfirm(false);
        setParticularChannel('')
    };

    useEffect(() => {
        GetExportData();
    }, []);

    useEffect(() => {
        if (modal) {
            GetMeterChannels();
            GetTransactionCode();
            getQuantityNames();
            getIndividualRecordData();
            setMdmDataStreamIdentifiers(props.mdmDataStreamIdentifiers || []);
            setRegisterIds(props.registerIds || []);
        }
    }, [modal])

    const selectOptions: any[] = [];
    channelList.forEach((option) => {
        selectOptions.push({
            label: option.name,
            value: option.name,
            quantity_type: option.quantity_type.type,
            unit_of_measurement: option.quantity_type.abbreviation,
            equivalent_300_channel: option.equivalent_300_channel

        });
    });

    const transactionOptions: ISelectOption[] = [];
    transactionCodes.forEach((option) => {
        transactionOptions.push({
            label: `${option.code} - ${option.action}`,
            value: option.code,
        });
    });

    const onDisableRecord500Click = () => {
        let Data = record_identifier_list.map((item) => {
            if (item.record_identifier === '500') {
                item.is_disabled = !item.is_disabled
            }
            if (item.is_disabled === true) {
                item.value_type = VALUE_TYPE.ACTUAL;
                item.channels = [];
                item.retailer_service_order = "";
                item.transaction_code = "";
            }
            return item;
        })

        setRecordIdentifierList(Data);
    }

    return (
        <>
            {alert}
            <CardTitle className="p-3 border-bottom mb-0 bg-light">
                <div className="d-flex justify-content-between align-items-center">
                    <h5 className="card-title mb-0">Export Data</h5>
                    {!props.isViewMode() && (
                        <div className="text-right">
                            {gridData.length > 0 ? (
                                <button onClick={editData} type="button" className="btn btn-info me-1">
                                    <span>
                                        <i className="fa fa-edit"></i> Edit
                                    </span>
                                </button>
                            ) : (
                                <button onClick={dataToggle} type="button" className="btn btn-info me-1">
                                    <span>
                                        <i className="fa fa-plus"></i> Add
                                    </span>
                                </button>
                            )}
                        </div>
                    )}

                </div>
            </CardTitle>
            <CardBody>
                <Table responsive>
                    <thead>
                        <tr>
                            <th scope="col">Row Interval</th>
                            <th scope="col">Value Type</th>
                            <th scope="col">Channel Name</th>
                        </tr>
                    </thead>
                    <tbody>{exportDataList()}</tbody>
                </Table>
            </CardBody>

            {
                modal &&
                <Modal size="xl" isOpen={modal}>
                    <ModalHeader toggle={handleDataClose}>Export Data</ModalHeader>
                    <ModalBody className="p-0">
                        {record_identifier_list.map((item, index) => {
                            let is300 = item.record_identifier === '300';
                            let selectedValue = item.channels?.map((subItem: { channel_name: string; quantity_type: string; unit_of_measurement: string; equivalent_300_channel: string; }) => {    // Changed & now working
                                return { label: subItem.channel_name, value: subItem.channel_name, quantity_type: subItem.quantity_type, unit_of_measurement: subItem.unit_of_measurement, equivalent_300_channel: subItem.equivalent_300_channel };
                            });
                            let temp = transactionCodes.find((t) => t.code === item.transaction_code)
                            let selectedCode: ISelectOption | null = null;
                            if (temp) {
                                selectedCode = {
                                    label: `${temp.code} - ${temp.action}`,
                                    value: temp.code,
                                }
                            }
                            return (
                                <React.Fragment key={index}>
                                    <CardTitle className="p-3 border-bottom mb-0 bg-light d-flex justify-content-between align-items-center">
                                        <h5 className="card-title mb-0">
                                            {' '}
                                            {item.record_identifier}
                                            &nbsp;Row Interval
                                        </h5>
                                        {item.record_identifier === "500" ? (
                                            <div className="d-flex flex-row">
                                                <div className="form-check form-switch">
                                                    <input
                                                        type="checkbox"
                                                        className="form-check-input"
                                                        checked={!item.is_disabled}
                                                        onChange={onDisableRecord500Click}
                                                    />
                                                </div>
                                            </div>
                                        ) : null}
                                    </CardTitle>
                                    {
                                        !item.is_disabled &&
                                        <CardBody>
                                            <>
                                                <Row>
                                                    <Col md="4">
                                                        <FormGroup>
                                                            <label className="control-label me-3" htmlFor="value_type">
                                                                Value Type
                                                            </label>
                                                            <div className="mb-1">
                                                                <FormGroup check inline>
                                                                    <Input
                                                                        type="radio"
                                                                        id={`actual${item.record_identifier}`}
                                                                        className="removeOverlap"
                                                                        value={VALUE_TYPE.ACTUAL}
                                                                        checked={item.value_type == VALUE_TYPE.ACTUAL}
                                                                        onChange={(e) =>
                                                                            onHandleChange(e.target.value, item.record_identifier)
                                                                        }
                                                                    />
                                                                    <Label check for={`actual${item.record_identifier}`}>
                                                                        {VALUE_LABEL.ACTUAL}
                                                                    </Label>
                                                                </FormGroup>
                                                                <FormGroup check inline>
                                                                    <Input
                                                                        type="radio"
                                                                        id={`usage${item.record_identifier}`}
                                                                        className="removeOverlap"
                                                                        value={VALUE_TYPE.USAGE}
                                                                        checked={item.value_type == VALUE_TYPE.USAGE}
                                                                        onChange={(e) =>
                                                                            onHandleChange(e.target.value, item.record_identifier)
                                                                        }
                                                                    />
                                                                    <Label check for={`usage${item.record_identifier}`}>
                                                                        {VALUE_LABEL.USAGE}
                                                                    </Label>
                                                                </FormGroup>
                                                            </div>
                                                        </FormGroup>
                                                    </Col>
                                                    {
                                                        item.record_identifier === "500" &&
                                                        <>
                                                            <Col md="4">
                                                                <FormGroup>
                                                                    <label htmlFor="transaction_code" className="control-label">
                                                                        Transaction Code *
                                                                    </label>
                                                                    <Select
                                                                        closeMenuOnSelect={true}
                                                                        components={{ ClearIndicator }}
                                                                        styles={getSelect2CSS(customizer)}
                                                                        isClearable={false}
                                                                        options={transactionOptions}
                                                                        value={selectedCode}
                                                                        placeholder={'Transaction Code'}
                                                                        inputId="transaction_code"
                                                                        onChange={(value) =>
                                                                            onTransactionCodeChange(value, item.record_identifier)
                                                                        }
                                                                        getOptionLabel={(option) => option.label}
                                                                        getOptionValue={(option) => option.value}
                                                                    />
                                                                </FormGroup>
                                                                {error && error[item.record_identifier]?.transaction_code ? (
                                                                    <div className="text-danger">
                                                                        {error[item.record_identifier]?.transaction_code}
                                                                    </div>
                                                                ) : null}
                                                            </Col>
                                                            <Col md="4">
                                                                <FormGroup>
                                                                    <label htmlFor="retailer_service_order" className="control-label">
                                                                        Retailer Service Order
                                                                    </label>
                                                                    <div className="mb-1">
                                                                        <input
                                                                            type="text"
                                                                            id="retailer_service_order"
                                                                            name="retailer_service_order"
                                                                            value={item.retailer_service_order}
                                                                            className="form-control"
                                                                            placeholder="Retailer Service Order"
                                                                            onChange={(e) => { onFieldValueChange(e, item.record_identifier) }}
                                                                        />
                                                                    </div>
                                                                </FormGroup>
                                                            </Col>
                                                        </>
                                                    }
                                                </Row>
                                                <Row className="mt-2">
                                                    <Col md={12}>
                                                        <FormGroup>
                                                            <label htmlFor={`channel${item.record_identifier}`} className="control-label">
                                                                Channel Name
                                                            </label>
                                                            <Select
                                                                closeMenuOnSelect={true}
                                                                components={{ ClearIndicator }}
                                                                isMulti={true}
                                                                styles={getSelect2CSS(customizer)}
                                                                isClearable
                                                                options={selectOptions}
                                                                value={selectedValue}
                                                                placeholder={'Channel Name'}
                                                                inputId={`channel${item.record_identifier}`}
                                                                onChange={(value) =>
                                                                    onChannelChange(value, item.record_identifier, selectedValue)
                                                                }
                                                                getOptionLabel={(option) => option.label}
                                                                getOptionValue={(option) => option.value}
                                                            />
                                                        </FormGroup>
                                                        {error && error[item.record_identifier]?.channel_name ? (
                                                            <div className="text-danger">
                                                                {error[item.record_identifier]?.channel_name}
                                                            </div>
                                                        ) : null}
                                                    </Col>
                                                </Row>
                                                {item.channels?.length > 0 && (
                                                    <>
                                                        <Table responsive>
                                                            <thead>
                                                                <tr>
                                                                    <th scope="col">Channel Name</th>
                                                                    {is300 && (
                                                                        <>
                                                                            <th scope="col">MDM Datastream</th>
                                                                            <th scope="col">RegisterID</th>
                                                                        </>
                                                                    )}
                                                                    <th scope="col">Quantity type</th>
                                                                    <th scope="col"> Unit of measurement</th>
                                                                    <th scope="col">{is300 ? 'Equivalent 500 channel' : 'Equivalent 300 channel'}</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>{getList(item)}</tbody>
                                                        </Table>
                                                    </>
                                                )}

                                            </>
                                        </CardBody>
                                    }
                                </React.Fragment>
                            );
                        })}
                    </ModalBody>
                    <ModalFooter>
                        <Button color="info" onClick={handleDataConfirm}>
                            Save
                        </Button>
                        <Button color="secondary" onClick={handleDataClose}>
                            Cancel
                        </Button>
                    </ModalFooter>
                    {
                        renderConfirm && (
                            <>
                                <ConfirmationDialog
                                    title={`Are you sure you want to remove ${particularChannel}? It will be deselect from the equivalent 500 channel. `}
                                    onCancel={hideRenderAlert}
                                    onConfirm={onYesClick}
                                    yesButtonText="Yes"
                                    noButtonText="No"
                                />
                            </>
                        )
                    }
                </Modal>

            }

        </>
    )
}
export default ExportData;