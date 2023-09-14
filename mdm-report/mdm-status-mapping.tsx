import React, { useEffect, useState } from "react";
import { Button, CardBody, CardTitle, Col, DropdownItem, FormGroup, Input, Modal, ModalBody, ModalFooter, ModalHeader, Row, Table } from "reactstrap";
import NEM12ReportService from "../../services/nem12-report/nem12-report.service";
import { getSelect2CSS, API_RESPONSE_CODE, API_ERROR_MESSAGE, DELETE_WARNING, STATUS_MAPPING_ERROR } from '../../utils';
import Select, { SingleValue } from 'react-select';
import { useSelector } from "react-redux";
import { ExtendedStore } from "../../types";
import { IExportProps, IMappingData, IMetrixStatus, IQualityFlags, IReasonCodes, ISelectOption, IErrorType,IGridDataType } from "./mdm-report.model";
import SweetAlert from "react-bootstrap-sweetalert";
import ConfirmationDialog from "../../components/confirmation-dialog";
import ErrorToast from "../../components/error-toast";
import _ from "lodash";
import { ClearIndicator } from "../../components/select-clear-indicator/select-clear-indicator";

const initialObject = {
    id: 1,
    metrix_status: '',
    quality_flag: '',
    reason_code: '',
    text_description: '',
}

const initialReasonCode = {
    label: "None",
    value: ''
}

const MDMStatusMapping = (props: IExportProps) => {

    const service = new NEM12ReportService();
    const customizer = useSelector((state: ExtendedStore) => state.customizer.isDark)

    const [alert, setAlert] = useState<JSX.Element | null>(null);   // Changed and now working
    const [modal, setModal] = useState<boolean>(false);
    const [gridData, setGridData] = useState<IGridDataType[]>([]);   //Changed & now working
    const [data, setData] = useState<IMappingData[]>([]);
    const [error, setError] = useState<IMappingData[] | null>();    // Changed but test
    const [methodFlag, setMethodFlag] = useState<ISelectOption[]>([]);  // Changed but test
    const [qualityFlag, setQualityFlag] = useState<ISelectOption[]>([]);
    const [reasonCode, setReasonCode] = useState<ISelectOption[]>([]);
    const [renderConfirm, setRenderConfirm] = useState<boolean>(false);
    const [renderToast, setRenderToast] = useState<boolean>(false);
    const [toastMessage, setToastMessage] = useState<string>('');
    const [removeId, setRemoveId] = useState<number>(0);
    const [allChecked, setAllChecked] = useState<boolean>(false);
    const [allLocalDataChecked, setAllLocalChecked] = useState<boolean>(false);

    const gridDataList = () => {
        let GriData = [...gridData];
        if (GriData.length > 0) {
            return GriData.map((item, index) => {
                return (
                    <tr key={index}>
                        <td>
                            <div className="form-check form-check-inline me-0 checkboxCenter">
                                <Input
                                    className="form-check-input"
                                    type="checkbox"
                                    id=""
                                    value=""
                                    checked={item.flag || allChecked}
                                    onChange={(e) => checkSingleCheckbox(e, index)}
                                />
                            </div>
                        </td>
                        <td>{item.metrix_status}</td>
                        <td>{item.quality_flag + '-' + item.quality_flag_description}</td>
                        <td>{item.reason_code ? (item.reason_code + '-' + item.actual_reason_description) : ''}{item.reason_code === '0' ? ` (${item.text_description})` : null}</td>
                        <td>
                            {!props.isViewMode() && (
                                <DropdownItem title="Delete" onClick={() => onDeleteClick(item.id)}>
                                    <i className="fas fa-trash"></i>
                                </DropdownItem>
                            )}
                        </td>
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

    const checkSingleCheckbox = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {    //Changed & now working
        let GridData = [...gridData];
        if (GridData[index])
            GridData[index].flag = e.target.checked;

        const selectedLength = (GridData.filter((row) => row.flag === true))?.length;

        if (selectedLength === gridData.length)
            setAllChecked(true);
        else
            setAllChecked(false);

        setGridData(GridData);
    };

    const handleAllDataChecked = (isChecked: boolean) => {
        let Data = [...gridData]
        Data.forEach((item: {flag: boolean}) => (item.flag = isChecked));   //Changed & now working
        setData(Data);
        setAllLocalChecked(isChecked);
        setAllChecked(isChecked)
    };

    const deleteAll = () => {
        let selectedData = gridData
            ?.filter((item) => item.flag)
            .map((item) => item.id);
        if (
            (allChecked && gridData && gridData.length) ||
            (selectedData && selectedData.length)
        ) {
            let selectedCount = selectedData?.length;
            let isAll = false;
            if (allChecked && selectedData && selectedData.length) {
                selectedCount = gridData.length;
                isAll = true;
                selectedData = [];
            }
            const msgTitle = `'Do you really want to delete ${selectedCount} data(s)?`;
            setAlert(
                <div>
                    <SweetAlert
                        customClass="custom-sweet-alert-width-35em custom-sweet-alert"
                        showCancel
                        focusCancelBtn={false}
                        focusConfirmBtn={false}
                        btnSize="md"
                        style={{ fontSize: "10px" }}
                        title={msgTitle}
                        confirmBtnText="Yes"
                        confirmBtnBsStyle="info"
                        onCancel={() => hideSweetAlert()}
                        cancelBtnBsStyle="danger"
                        cancelBtnText="No"
                        onConfirm={async () => {
                            const saveParams: {ids: number[], is_all: boolean } = {
                                ids: selectedData || [],
                                is_all: isAll,
                            };
                            const response = await service
                                .DeleteNEM12ReportStatusMapping(props.id, saveParams)
                                .catch((m) => {
                                    setToastMessage(m.data.message);
                                    setRenderToast(true);
                                });
                            if (
                                response &&
                                response.code &&
                                response.code === API_RESPONSE_CODE.SUCCESS
                            ) {
                                setAlert(
                                    <div>
                                        <SweetAlert
                                            success
                                            customClass="custom-sweet-alert-width-35em custom-sweet-alert"
                                            title={response.messages}
                                            onConfirm={async () => {
                                                hideSweetAlert();
                                                await GetNEM12StatusMappingData();
                                                setAllChecked(false);
                                                setAllLocalChecked(false);
                                            }}
                                        />
                                    </div>
                                )
                            }
                        }}
                    ></SweetAlert>
                </div>
            )
        } else {
            setAlert(
                <div>
                    <SweetAlert
                        customClass="custom-sweet-alert-width-35em custom-sweet-alert"
                        focusCancelBtn={false}
                        focusConfirmBtn={false}
                        btnSize="md"
                        style={{ fontSize: '10px' }}
                        title="Please select atleat one data"
                        confirmBtnText="Ok"
                        confirmBtnBsStyle="info"
                        onConfirm={hideSweetAlert}
                    ></SweetAlert>
                </div>
            )
        }

    }

    const onDeleteClick = (id: number) => {
        setRenderConfirm(true);
        setRemoveId(id);
    };

    const GetNEM12StatusMappingData = async () => {
        const gridData = (await service.GetNEM12ReportStatusMappings(props.id)).data || [];
        if (Array.isArray(gridData) && gridData.length > 0) {
            setGridData(gridData)
        } else {
            setGridData([]);
        }
        setAllLocalChecked(false);
    };

    const dataToggle = () => {
        setModal(!modal);
        setData([{ ...initialObject }])
    };

    const handleDataClose = () => {
        setModal(false);
        setError(null);
        setData([{ ...initialObject }]);
    }

    const validateRequiredData = (data: IMappingData[]) => {    // Changed but test
        setError(null);
        if (data) {
            const errorList: any = {};
            data.forEach((item: IMappingData) => {
                const fieldError: {[key: string]: string} = {};  // Changed but test
                if (!item.metrix_status) {
                    fieldError[`metrix_status`] = STATUS_MAPPING_ERROR.METRIX_STATUS;
                }
                if (!item.quality_flag) {
                    fieldError[`quality_flag`] = STATUS_MAPPING_ERROR.QUALITY_FLAG;
                }
                if (item.reason_code === "0" && !item.text_description) {
                    fieldError[`text_description`] = STATUS_MAPPING_ERROR.TEXT_DESCRIPTION;
                }
                if (fieldError && Object.keys(fieldError).length) {
                    errorList[item.id] = fieldError;
                }
            });
            return errorList;
        }
    };

    const handleDataConfirm = async () => {
        const error = validateRequiredData(data);
        if (error && Object.keys(error).length) {
            setError(error)
            return false;
        }

        let updatedList = data.map((item, index) => {
            return {
                ...item,
                id: 0
            }
        })
        const requestObj = {
            data: updatedList,
            is_update: gridData.length > 0 ? true : false
        }
        const response = await service.SaveNEM12ReportStatusMapping(props.id, requestObj);
        if (response && response.code && response.code === API_RESPONSE_CODE.SUCCESS) {
            setAlert(
                <div>
                    <SweetAlert
                        success
                        title={response.messages}
                        onConfirm={() => {
                            hideSweetAlert();
                            dataToggle();
                            GetNEM12StatusMappingData();
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
                            hideSweetAlert();
                            dataToggle();
                            GetNEM12StatusMappingData();
                        }}
                    />
                </div>
            )
        }
    };

    const hideSweetAlert = () => {
        setAlert(null);
    };

    const hideAlert = () => {
        setRenderConfirm(false);
        setRemoveId(0);
    };

    const onYesClick = async () => {
        const saveParams: {ids: number[], is_all: boolean } = {  // Changed & now working
            ids: [removeId || 0],
            is_all: false,
        };
        if (removeId && gridData && gridData.length) {
            const response = await service
                .DeleteNEM12ReportStatusMapping(props.id, saveParams)
                .catch((m) => {
                    setToastMessage(m.data.message);
                    setRenderToast(true);
                });
            if (
                response &&
                response.code &&
                response.code === API_RESPONSE_CODE.SUCCESS
            ) {
                setAlert(
                    <div>
                        <SweetAlert
                            success
                            customClass="custom-sweet-alert-width-35em custom-sweet-alert"
                            title={response.messages}
                            onConfirm={async () => {
                                hideSweetAlert();
                                await GetNEM12StatusMappingData();
                            }}
                        />
                    </div>
                )
            }
            else {
                setToastMessage(API_ERROR_MESSAGE);
                setRenderToast(true);
            }
        }
        hideAlert();
    };

    const getNem12StatusData = async () => {
        const res = (await service.GetNem12StatusData()).data || {};
        if (res && res.metrixStatus && res.qualityFlags && res.reasonCodes) {
            let methodFlags: ISelectOption[] = [];
            let qualityFlags: ISelectOption[] = [];
            let reasonCodes: ISelectOption[] = [{ ...initialReasonCode }];
            res.metrixStatus.map((t: IMetrixStatus) => {
                methodFlags.push({
                    label: t.text,
                    value: t.value
                })
            })
            res.qualityFlags.map((t: IQualityFlags) => {
                qualityFlags.push({
                    label: t.text,
                    value: t.quality_flag
                })
            })
            res.reasonCodes.map((t: IReasonCodes) => {
                reasonCodes.push({
                    label: t.text,
                    value: t.reason_code
                })
            })
            setMethodFlag(methodFlags)
            setQualityFlag(qualityFlags);
            setReasonCode(reasonCodes);
        }
    }

    const onMetrixChange = async (e: SingleValue<ISelectOption>, index: number) => {    //Chnaged & now working
        let Data = [...data];
        let selectedMethodFlags: string[];  //Changed & now working
        selectedMethodFlags = Data.map((x: IMappingData) => x['metrix_status']); //Changed & now working
        let selected = false;
        for (let i = 0; i < selectedMethodFlags.length; i++) {
            if (selectedMethodFlags[i] === e?.value) { //Changed & now working
                selected = true;
                break;
            }
        }
        if (selected) {
            setAlert(
                <div>
                    <SweetAlert
                        title={`${e?.value} is already selected.`}  //Changed & now working
                        onConfirm={() => hideSweetAlert()}
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
            Data[index].metrix_status = e?.value ?? ''; // Changed & now working
            setData(Data);
        }
    }

    const onQualityChange = (e: SingleValue<ISelectOption>, index: number) => {
        let Data = [...data];
        Data[index].quality_flag = e?.value ?? '';  //Chnaged & now working
        setData(Data)
    }

    const onReasonCodeChange = (e: SingleValue<ISelectOption>, index: number) => {
        let Data = [...data];
        Data[index].reason_code = e?.value ?? ''; //Chnaged & now working
        Data[index].text_description = "";
        setData(Data)
    }

    const onFieldValuChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
        let Data = [...data];
        Data[index].text_description = e.target.value
        setData(Data)
    }

    const getList = () => {
        if (methodFlag && qualityFlag && reasonCode) {
            return data?.map((t: IMappingData, index: number) => {
                let selectedMethodFlag: ISelectOption | null = null;
                let selectedQualityFlag: ISelectOption | null = null;
                let selectedReasoncode: ISelectOption | null = null;
                let temp1 = methodFlag.filter((m) => m.value === t.metrix_status);
                let temp2 = qualityFlag.filter((q) => q.value === t.quality_flag);
                let temp3 = reasonCode.filter((r) => r.value === t.reason_code);
                if (temp1 && temp1.length) {
                    selectedMethodFlag = {
                        label: temp1[0]?.label,
                        value: temp1[0]?.value
                    }
                }
                if (temp2 && temp2.length) {
                    selectedQualityFlag = {
                        label: temp2[0]?.label,
                        value: temp2[0]?.value
                    }
                }
                if (temp3 && temp3.length) {
                    selectedReasoncode = {
                        label: temp3[0]?.label,
                        value: temp3[0]?.value
                    }
                }
                return (
                    <tr className="mt-3" key={t.id}>
                        <td>
                            <FormGroup>
                                <Select
                                    closeMenuOnSelect={true}
                                    styles={getSelect2CSS(customizer)}
                                    components={{ ClearIndicator }}
                                    options={methodFlag}
                                    placeholder="Metrix status"
                                    name="metrix_status"
                                    id="metrix_status"
                                    value={selectedMethodFlag}
                                    className="z-index-2 position-absolute custom-td-width"
                                    onChange={(e) => onMetrixChange(e, index)}
                                />
                            </FormGroup>
                            {error && error[t.id]?.metrix_status ? (
                                <div className="text-danger td-error-div">
                                    {error[t.id]?.metrix_status}
                                </div>
                            ) : null}
                        </td>
                        <td>
                            <FormGroup>
                                <Select
                                    closeMenuOnSelect={true}
                                    styles={getSelect2CSS(customizer)}
                                    components={{ ClearIndicator }}
                                    options={qualityFlag}
                                    placeholder="Quality flag"
                                    name="quality_flag"
                                    id="quality_flag"
                                    value={selectedQualityFlag}
                                    className="z-index-2 position-absolute custom-td-width"
                                    onChange={(e) => onQualityChange(e, index)}
                                />
                            </FormGroup>
                            {error && error[t.id]?.quality_flag ? (
                                <div className="text-danger td-error-div">
                                    {error[t.id]?.quality_flag}
                                </div>
                            ) : null}
                        </td>
                        <td>
                            <FormGroup>
                                <Select
                                    closeMenuOnSelect={true}
                                    styles={getSelect2CSS(customizer)}
                                    components={{ ClearIndicator }}
                                    options={reasonCode}
                                    placeholder="Reason Code"
                                    name="reason_code"
                                    id="reason_code"
                                    value={selectedReasoncode}
                                    className="z-index-2 position-absolute custom-td-width"
                                    onChange={(e) => onReasonCodeChange(e, index)}
                                />
                            </FormGroup>
                            {error && error[t.id]?.reason_code ? (
                                <div className="text-danger td-error-div">
                                    {error[t.id]?.reason_code}
                                </div>
                            ) : null}
                        </td>
                        <td>
                            {selectedReasoncode && selectedReasoncode.value === "0" ? (
                                <>
                                    <FormGroup>
                                        <input
                                            type="text"
                                            id="description"
                                            name="code"
                                            value={t.text_description}
                                            className="form-control"
                                            placeholder="Description"
                                            onChange={(e) => onFieldValuChange(e, index)}
                                        />
                                    </FormGroup>
                                    {error && error[t.id]?.text_description ? (
                                        <div className="text-danger">
                                            {error[t.id]?.text_description}
                                        </div>
                                    ) : null}
                                </>
                            ) : null}
                        </td>
                        <td>
                            <Button color="danger" onClick={() => removeDataAlert(t.id)}>
                                <i className="mdi mdi-delete" style={{ fontSize: '15px' }}></i>
                            </Button>
                        </td>
                    </tr>
                )
            })
        }
        else {
            return null
        }
    }

    const removeDataAlert = (id: number) => {
        setAlert(
            <div>
                <SweetAlert
                    customClass="custom-sweet-alert-width-35em custom-sweet-alert"
                    showCancel
                    focusCancelBtn={false}
                    focusConfirmBtn={false}
                    btnSize="md"
                    style={{ fontSize: '10px' }}
                    title={DELETE_WARNING}
                    confirmBtnText="Yes"
                    confirmBtnBsStyle="info"
                    onCancel={hideSweetAlert}
                    cancelBtnBsStyle="danger"
                    cancelBtnText="No"
                    onConfirm={() => cancelClick(id)}
                ></SweetAlert>
            </div>
        )
    };

    const cancelClick = (id: number) => {
        let Data = _.cloneDeep(data);
        if (Data.length <= 1) {
            setData([{ ...initialObject }]);
            setError(null)          // Bug Chnages
        }
        else {
            setData(Data.filter((x) => {
                return x.id !== id;
            }))
        }
        hideSweetAlert();
    }

    const onAddClick = () => {
        let Data = [...data];
        const newObj = {
            id: Number(Date.now()),
            metrix_status: '',
            quality_flag: '',
            reason_code: '',
            text_description: '',
            flag: false,
        };
        Data.push(newObj);
        setData(Data);
    }

    const editData = async () => {
        setData(_.cloneDeep(gridData));
        setModal(!modal);
    };

    useEffect(() => {
        GetNEM12StatusMappingData();
    }, []);

    useEffect(() => {
        if (modal) {
            getNem12StatusData();
        }
    }, [modal])

    return (
        <>
            {alert}
            <CardTitle className="p-3 border-bottom mb-0 bg-light d-flex justify-content-between align-items-center">
                Manage Quality Flags and Reason Codes
                <div className="d-flex flex-row">
                    {!props.isViewMode() && (
                        <div className="text-right">
                            {gridData.length > 0 ? (
                                <>
                                    <button onClick={editData} type="button" className="btn btn-info me-1">
                                        <span>
                                            <i className="fa fa-edit"></i> Edit
                                        </span>
                                    </button>
                                    <button onClick={deleteAll} type="button" className="btn btn-danger me-1">
                                        <span>
                                            <i className="fa fa-trash"></i> Delete
                                        </span>
                                    </button>
                                </>
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
                            <th>
                                <div className="form-check form-check-inline me-0 checkboxCenter">
                                    <Input
                                        checked={
                                            allLocalDataChecked || allChecked
                                        }
                                        className="form-check-input"
                                        id=""
                                        type="checkbox"
                                        value=""
                                        onChange={(e) => handleAllDataChecked(e.target.checked)}
                                    />
                                </div>
                            </th>
                            <th scope="col">Metrix Status</th>
                            <th scope="col">Quality Flag</th>
                            <th scope="col">Reason Code</th>
                            {!props.isViewMode() && (<th scope="col">Delete</th>)}
                        </tr>
                    </thead>
                    <tbody>{gridDataList()}</tbody>
                </Table>
            </CardBody>
            {
                modal &&
                <Modal size="lg" isOpen={modal} style={{ maxWidth: '1100px' }}>
                    <ModalHeader toggle={handleDataClose}>Manage MDM Status Mapping</ModalHeader>
                    <ModalBody className="p-0">
                        <CardBody>
                            <Table responsive>
                                <thead>
                                    <tr>
                                        <th scope="col" className="custom-th-width">Metrix Status</th>
                                        <th scope="col" className="custom-th-width">Quality Flag</th>
                                        <th scope="col" className="custom-th-width">Reason Code</th>
                                        <th scope="col" className="custom-th-width">Text Descrption</th>
                                        <th scope="col"></th>
                                    </tr>
                                </thead>
                                <tbody>{getList()}</tbody>
                            </Table>
                            <Row>
                                <Col md={2}>
                                    <Button
                                        className="btn mt-2 ml-3"
                                        color="info"
                                        onClick={() => onAddClick()}
                                    >
                                        <i className="mdi mdi-plus"> </i>
                                        ADD
                                    </Button>
                                </Col>
                            </Row>
                        </CardBody>
                    </ModalBody>
                    <ModalFooter>
                        <Button color="info" onClick={handleDataConfirm}>
                            Save
                        </Button>
                        <Button color="secondary" onClick={handleDataClose}>
                            Cancel
                        </Button>
                    </ModalFooter>
                </Modal>
            }
            {renderConfirm && (
                <>
                    <ConfirmationDialog
                        title={DELETE_WARNING}
                        onCancel={hideAlert}
                        onConfirm={onYesClick}
                        yesButtonText="Yes"
                        noButtonText="No"
                    />
                </>
            )}
            {renderToast && (
                <>
                    <ErrorToast
                        buttonText="OK"
                        onConfirm={() => {
                            setRenderToast(false);
                        }}
                        message={toastMessage || ''}
                    />
                </>
            )}

        </>
    )
}
export default MDMStatusMapping;