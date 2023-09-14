import { useEffect, useState } from "react";
import SweetAlert from "react-bootstrap-sweetalert";
import { SortOrder } from "react-bootstrap-table";
import { CardBody, Row, Col, FormGroup, Button, Input, Modal, ModalHeader, ModalBody, FormText, ModalFooter } from "reactstrap";
import ConfirmationDialog from "../../components/confirmation-dialog";
import DataTable from "../../components/datatable/datatable";
import ErrorToast from "../../components/error-toast";
import GridMenu from "../../components/grid-menu";
import { IPaginationParams } from "../../types";
import { ACTION, API_ERROR_MESSAGE, API_RESPONSE_CODE, DATE_TIME_FORMAT, DEFAULT_VALUES, DELETE_WARNING, HEADER_CLASS_NAME, REPORT_COLUMNS } from "../../utils";
import 'react-datetime/css/react-datetime.css';
import { IGridProps, IMDMGridData, IErrorType, IGridDataType } from "./mdm-report.model";
import NEM12ReportService from "../../services/nem12-report/nem12-report.service";
import MDMStatusModal from "./mdm-status-modal";
import _ from "lodash";
import moment from "moment";
import Datetime from 'react-datetime';

const initialPaginationParamas = {
    page: DEFAULT_VALUES.PAGE_INDEX - 1,
    pageSize: DEFAULT_VALUES.PAGE_SIZE,
    offset: 0,
    orderBy: 'name',
    direction: 'asc',
}

const initialErrorObject = {
    execute_from_date: '',
    execute_to_date: '',
};

const Grid = (props: IGridProps) => {

    const service = new NEM12ReportService();

    const [alert, setAlert] = useState<JSX.Element | null>(null);   // Changed & now working
    const [pagination, setPagination] = useState<IPaginationParams>(initialPaginationParamas);
    const [gridData, setGridData] = useState<IGridDataType[]>([]); // Changed & now working
    const [totalCount, setTotalCount] = useState<number>(0);
    const [name, setName] = useState<string>('');
    const [virtualName, setVirtualName] = useState<string>('');
    const [renderConfirm, setRenderConfirm] = useState<boolean>(false);
    const [renderToast, setRenderToast] = useState<boolean>(false);
    const [toastMessage, setToastMessage] = useState<string>('');
    const [removeId, setRemoveId] = useState<number>(0);
    const [selectAllCheck, setSelectAllCheck] = useState<boolean>(false);
    const [allReportChecked, setAllReportChecked] = useState<boolean>(false);
    const [isAll, setIsAll] = useState<boolean>(false);
    const [activeInactiveModal, setActiveInactiveModal] = useState<boolean>(false);
    const [flag, setFlag] = useState<boolean>(false);
    const [reportStatusIds, setReportStatusIds] = useState<number[]>([]);
    const [modal, setModal] = useState<boolean>(false);
    const [executeFromDate, setExecuteFromDate] = useState<string | moment.Moment>('');
    const [executeToDate, setExecuteToDate] = useState<string | moment.Moment>('');
    const [executeReportId, setExecuteReportId] = useState<number>(0);
    const [error, setError] = useState<IErrorType>(initialErrorObject);
    const [executionReportName, setExecutionReportName] = useState<string>("");

    const getNEM12Data = async () => {
        const { offset, orderBy, direction, pageSize } = { ...pagination }
        const requestObject = {
            name: virtualName,
            pageIndex: offset,
            pageSize,
            orderBy,
            direction
        }

        const res = (await service.GetNEM12Report(requestObject)).data || [] as IMDMGridData[];

        if (Array.isArray(res) && res.length > 0) {
            setGridData(res)
            setTotalCount(res[0].total_length);
        }
        else {
            setGridData([])
            setTotalCount(0);
        }
    }

    const handleAllMeterScheduleChecked = (isChecked: boolean) => {
        const GridData = [...gridData];
        GridData?.forEach((item: {flag: boolean}) => (item.flag = isChecked));  // Changed & now working
        setGridData(GridData);
        setAllReportChecked(isChecked);
        setSelectAllCheck(isChecked && selectAllCheck ? false : selectAllCheck);
    };


    const checkSingleCheckbox = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
        let GridData = [...gridData];
        if (GridData[index])
            GridData[index].flag = e.target.checked;

        const selectedLength = (GridData.filter((row) => row.flag === true))?.length;

        if (selectedLength === gridData.length)
            setAllReportChecked(true);
        else
            setAllReportChecked(false);

        setGridData(GridData);
    };

    const prepareGridHeader = () => {
        const columns = [
            {
                Header: (
                    <div className="form-check form-check-inline me-0 checkboxCenter">
                        <Input
                            name="selectAll"
                            checked={allReportChecked || selectAllCheck}
                            className="form-check-input"
                            type="checkbox"
                            id="selectAll"
                            value=""
                            onChange={(e) => handleAllMeterScheduleChecked(e.target.checked)}   // Changed & now working
                        />
                    </div>
                ),
                id: 'is_checked',
                sortable: false,
                filterable: false,
                width: 70,
                headerClassName: HEADER_CLASS_NAME,
                recordStatusInfo: {
                    columnName: 'is_active'
                },
                Cell: ({ original: row, index }: any) => {
                    return (
                        <div className="form-check form-check-inline me-0 checkboxCenter">
                            <Input
                                className="form-check-input"
                                type="checkbox"
                                id=""
                                value=""
                                checked={row.flag || selectAllCheck}
                                onChange={(e) => checkSingleCheckbox(e, index)}
                            />
                        </div>
                    );
                },
            },
            {
                Header: REPORT_COLUMNS.NAME.HEADER,
                accessor: REPORT_COLUMNS.NAME.ACCESSOR,
                sortable: true,
                headerClassName: HEADER_CLASS_NAME,
                Cell: ({ original: row }: any) => {
                    return (
                        <div>
                            <a href="#" className="linkStyle">
                                {row.is_active === false ? <span data-tip={`${row.name}(Inactive)`}>{row.name}</span> : <span title={row.name}>{row.name}</span>}
                            </a>
                        </div>
                    )
                },
            },
            {
                Header: REPORT_COLUMNS.TIMEZONE.HEADER,
                accessor: REPORT_COLUMNS.TIMEZONE.ACCESSOR,
                sortable: true,
                headerClassName: HEADER_CLASS_NAME,
                Cell: ({ original: row }: any) => {
                    return <span title={row.report_timezone}>{row.report_timezone}</span>;
                },
            },
            {
                Header: REPORT_COLUMNS.CRON_EXPRESSION.HEADER,
                accessor: REPORT_COLUMNS.CRON_EXPRESSION.ACCESSOR,
                sortable: true,
                headerClassName: HEADER_CLASS_NAME,
                Cell: ({ original: row }: any) => {
                    return <span title={row.execution_cron}>{row.execution_cron}</span>;
                },
            },
            {
                Header: REPORT_COLUMNS.REPORT_PERIOD.HEADER,
                accessor: REPORT_COLUMNS.REPORT_PERIOD.ACCESSOR,
                sortable: true,
                headerClassName: HEADER_CLASS_NAME,
                Cell: ({ original: row }: any) => {
                    return <span title={row.report_period}>{row.report_period}</span>;
                },
            },
            {
                Header: REPORT_COLUMNS.ACTION.HEADER,
                width: 70,
                sortable: false,
                accessor: REPORT_COLUMNS.ACTION.ACCESSOR,
                headerClassName: 'text-center react-table-grid-header',
                className: 'text-center d-flex justify-content-center',
                filterable: false,
                Cell: ({ original: row }: any) => {
                    return (
                        <GridMenu
                            viewClick={props.editData}
                            editClick={props.editData}
                            deleteClick={onDeleteClick}
                            executeClick={executeData}
                            editAction={ACTION.EDIT}
                            viewAction={ACTION.VIEW}
                            id={row.id}
                            rowData={row}
                            report_name={row.name}
                            activeStatus={row.is_active}
                            isCopyAvailable={true}
                            onCopyClick={onCopyclick}
                            showValidationStatus={true}
                            onValidationStatusClick={reportActiveInactiveClick}
                            moduleName="NEM12Report"
                        />
                    );
                },
            },
        ] as any;
        return columns;
    }

    const executeData = (id: number, rowData: { name: string }) => {
        setModal(!modal);
        setExecuteReportId(id);
        setExecutionReportName(rowData.name);
    };

    const toggleModal = () => {
        setModal(!modal);
        setExecuteFromDate('');
        setExecuteToDate('');
        setError(initialErrorObject);
        setExecutionReportName('');
    };

    const handleValidation = () => {
        let execute_from_date = _.cloneDeep(executeFromDate);
        let execute_to_date = _.cloneDeep(executeToDate);
        let error_object = _.cloneDeep(error);
        let formIsValid = true;
        error_object.execute_from_date = '';
        error_object.execute_to_date = '';
        if (!execute_from_date) {
            formIsValid = false;
            error_object.execute_from_date = 'From date is required';
        }

        if (!execute_to_date) {
            formIsValid = false;
            error_object.execute_to_date = 'To date is required';
        }

        if (execute_from_date && execute_to_date && execute_from_date > execute_to_date) {
            formIsValid = false;
            error_object.execute_to_date = 'To Date Cannot Be Before From Date';
        }

        if (!formIsValid) {
            setError(error_object)
        }
        return formIsValid;
    }

    const executeCall = async () => {
        if (handleValidation()) {
            let object = {
                from_date: moment(executeFromDate).format(DATE_TIME_FORMAT.REQUEST_DATE_TIME),
                to_date: moment(executeToDate).format(DATE_TIME_FORMAT.REQUEST_DATE_TIME),
                execution_id: 0,
            };
            let response = {
                status: 200,
                messages: '',
                code: 200,
                data: {
                    id: 0,
                },
            };
            response = await service.GetExecuteCall(executeReportId, object);
            if (response.code === API_RESPONSE_CODE.SUCCESS) {
                setAlert(
                    <div>
                        <SweetAlert
                            success
                            title={response.messages}
                            onConfirm={() => {
                                hideSweetAlert();
                                toggleModal();
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
                                toggleModal();
                            }}
                        />
                    </div>
                )
            }
        }
    };

    const reportActiveInactiveClick = async (id: number, status: boolean) => {
        let ids: number[] = [];
        ids.push(id);

        const requestObject = {
            ids: ids,
            is_all: false,
            is_active: !status,
            name: virtualName,
        }

        let response = {
            status: 200,
            messages: '',
            code: 200,
            data: 0,
        };

        response = await service.UpdateNEM12ReportStatus(requestObject);

        if (response.code === API_RESPONSE_CODE.SUCCESS) {
            setAlert(
                <div>
                    <SweetAlert
                        success
                        title={response.messages}
                        onConfirm={async () => {
                            setAlert(null)
                            await getNEM12Data();
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
                        onConfirm={async () => {
                            setAlert(null)
                        }}
                    />
                </div>
            )
        }
    }

    const onSearchButtonClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();

        let newPagination = { ...pagination }
        newPagination = {
            ...newPagination,
            pageIndex: 0,
            offset: 0
        }
        setVirtualName(name);
        setPagination(newPagination);
    }

    const onRowClick = (rowInfo?: { id: number }) => {
        if (rowInfo) {
            props.editData(rowInfo.id, ACTION.VIEW);
        }
    };

    const onDeleteClick = (id: number) => {
        setRenderConfirm(true);
        setRemoveId(id);
    };

    const handlePageChange = async (page: number, sizePerPage: number) => {
        const offset = page * sizePerPage;
        let newPagination = { ...pagination };
        newPagination = {
            ...newPagination,
            pageIndex: page + 1,
            offset,
            pageSize: sizePerPage,
            direction: pagination?.direction || '',
            orderBy: pagination?.orderBy || '',
        };
        setPagination(newPagination);
    }

    const handleSorting = async (order: SortOrder, dataField: string) => {
        let newPagination = { ...pagination };
        newPagination = {
            ...newPagination,
            orderBy: dataField,
            direction: order,
            page: DEFAULT_VALUES.PAGE_INDEX,
            offset: DEFAULT_VALUES.OFFSET,
            pageSize: newPagination?.pageSize || DEFAULT_VALUES.PAGE_SIZE,
        };
        setPagination(newPagination)
    }

    const onClearButtonClick = () => {
        setName("");
        setVirtualName("");
        setPagination(initialPaginationParamas);
    }

    const onFieldValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setName(e.target.value);
    }

    const handleKeyPress = (e: any) => {
        if (e.which === 13) {
            onSearchButtonClick(e);
        }
    }

    const hideAlert = () => {
        setRenderConfirm(false);
        setRemoveId(0);
    }

    const hideSweetAlert = () => {
        setAlert(null);
    }

    const onYesClick = async () => {
        if (removeId && gridData && gridData.length) {
            const response = await service.DeleteNEM12Report(removeId);

            if (response && response.code && response.code === API_RESPONSE_CODE.SUCCESS) {
                setAlert(
                    <div>
                        <SweetAlert
                            success
                            customClass="custom-sweet-alert-width-35em custom-sweet-alert"
                            title={response.messages}
                            onConfirm={async () => {
                                setAlert(null);
                                await getNEM12Data();
                            }}
                        />
                    </div>
                )

            } else {
                setToastMessage(API_ERROR_MESSAGE);
                setRenderToast(true)
            }
        }
        hideAlert();
    }

    const onSelectAllReports = (is_checked: boolean) => {
        if (is_checked) {
            let GridData = [...gridData]
            GridData?.forEach((item) => (item.flag = !is_checked));
            setGridData(GridData);
            setSelectAllCheck(is_checked);
            setAllReportChecked(!is_checked)
        } else {
            setSelectAllCheck(is_checked);
        }
    }

    const stateReportActiveInactive = () => {
        let selectedData = gridData
            ?.filter((item: { flag: boolean }) => item.flag)  //Changed & now working
            .map((item: { id: number }) => item.id);
        if ((selectAllCheck && gridData && gridData.length) || (selectedData && selectedData.length)) {
            let selectedCount = selectedData?.length;
            let isAll = false;
            if (selectAllCheck && gridData && gridData.length) {
                selectedCount = gridData[0].total_length;
                isAll = true;
                selectedData = [];
            }
            setReportStatusIds(selectedData)
            setIsAll(isAll)
            setFlag(true)
        } else {
            setAlert(
                <div>
                    <SweetAlert
                        customClass="custom-sweet-alert-width-35em custom-sweet-alert"
                        btnSize="md"
                        style={{ fontSize: "10px" }}
                        title="Please select atleast one report."
                        onConfirm={() => {
                            setAlert(null);
                        }}
                        onCancel={() => setAlert(null)}
                        cancelBtnBsStyle="btn-info"
                        confirmBtnText="Ok"
                        cancelBtnCssClass="btn-info"
                        confirmBtnCssClass="btn-info"
                        focusCancelBtn={false}
                        focusConfirmBtn={false}
                    ></SweetAlert>
                </div>
            )
        }
    }

    const getDataForExport = async () => {
        const exportObject = {
            columns: [],
            data: [],
        } as { columns: [], data: [] };   // Changed & now works

        const columns: any = prepareGridHeader();
        const { orderBy, direction } = { ...pagination }

        if (gridData && gridData.length) {

            const searchparams = {
                name: virtualName,
                pageIndex: 0,
                pageSize: gridData[0].total_length,
                orderBy,
                direction
            };
            const res = (await service.GetNEM12Report(searchparams)).data || [] as IMDMGridData[];

            exportObject.columns = columns.slice(1);
            exportObject.data = res;
        }
        return exportObject;
    };

    const activeInactiveModalClosehandler = () => {
        setActiveInactiveModal(false);
        setReportStatusIds([]);
        setIsAll(false);
        setFlag(false);
    }

    const reportActiveInactiveModalOpenHandler = () => {
        setActiveInactiveModal(true);
    }

    const activeInactiveModalSubmithandler = () => {
        setActiveInactiveModal(false);
        setReportStatusIds([]);
        setIsAll(false);
        setFlag(false);
        setAllReportChecked(false);
        setSelectAllCheck(false);
        let newPagination = { ...pagination };
        newPagination = {
            ...newPagination,
            pageIndex: 0,
            offset: 0,
        };
        setPagination(newPagination)
    }
    const onCopyclick = (id: number, editAction: string) => {

        setAlert(
            <div>
                <SweetAlert
                    customClass="custom-sweet-alert-width-35em custom-sweet-alert"
                    showCancel
                    focusCancelBtn={false}
                    focusConfirmBtn={false}
                    btnSize="md"
                    style={{ fontSize: '10px' }}
                    title='Are you sure you want to copy this NEM12 Report?'
                    confirmBtnText="Yes"
                    confirmBtnBsStyle="info"
                    onCancel={() => hideSweetAlert()}
                    cancelBtnBsStyle="danger"
                    cancelBtnText="No"
                    onConfirm={async () => {
                        hideSweetAlert();
                        const res = await service.CopyNEM12Report(id);
                        if (res && res.code === API_RESPONSE_CODE.SUCCESS) {
                            props.editData(res.data, editAction);
                        }
                    }}
                ></SweetAlert>
            </div>
        )
    }

    useEffect(() => {
        getNEM12Data();
    }, [pagination]);

    useEffect(() => {
        if (flag) reportActiveInactiveModalOpenHandler();
    }, [flag])

    return (
        <>
            {alert}
            <CardBody className="remove-padding-bottom">
                <div>
                    {alert}
                    <Row>
                        <Col md="3">
                            <FormGroup>
                                <label className="control-label" htmlFor="name">
                                    Name
                                </label>
                                <div className="mb-2">
                                    <input
                                        type="text"
                                        name="name"
                                        id="name"
                                        className="form-control"
                                        onChange={onFieldValueChange}
                                        autoComplete={'off'}
                                        value={name}
                                        onKeyPress={handleKeyPress}
                                    />
                                </div>
                            </FormGroup>
                        </Col>
                        <Col md="3" className="label-margin">
                            <label></label>
                            <div className="gap-2 d-flex">
                                <Button
                                    color="info"
                                    type="button"
                                    className="btn"
                                    onClick={onSearchButtonClick}
                                >
                                    Search
                                </Button>
                                <Button type="button" className="btn ml-2" onClick={onClearButtonClick}>
                                    Clear
                                </Button>
                            </div>
                        </Col>
                    </Row>
                </div>
            </CardBody>
            <CardBody className="remove-padding-top">
                <DataTable
                    pageTableKey={'NEM12ReportGridKey'}
                    columns={prepareGridHeader()}
                    data={gridData}
                    rowsPerPage={pagination.pageSize || 10}
                    currentPage={pagination.pageIndex || 1}
                    totalCount={totalCount}
                    sortColumn={pagination.orderBy || 'name'}
                    sortOrder={pagination.direction || 'ASC'}
                    key={Math.random()}
                    handlePageChange={handlePageChange}
                    handleSort={handleSorting}
                    onRowClick={onRowClick}
                    getDataForExport={getDataForExport}
                    displayTotalRecords={true}
                    selectAllRecords={onSelectAllReports}
                    selectAllChecked={selectAllCheck}
                    showMeterActiveInActive={true}
                    moduleName="NEM12Report"
                    onShowMeterActiveInactiveClick={stateReportActiveInactive}
                    filename={'NEM12-Reports'}
                />

            </CardBody>
            {
                activeInactiveModal &&
                <MDMStatusModal
                    isOpen={activeInactiveModal}
                    toggleCloseModal={activeInactiveModalClosehandler}
                    toggleSubmitModal={activeInactiveModalSubmithandler}
                    ids={reportStatusIds}
                    isAll={isAll}
                    name={name}
                    getReports={getNEM12Data}
                />
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
            {modal && (
                <Modal isOpen={modal} toggle={toggleModal} className="modal-dialog modal-lg">
                    <ModalHeader toggle={toggleModal}>Execute ({executionReportName})</ModalHeader>
                    <ModalBody>
                        <div>
                            <Row>
                                <Col md="6">
                                    <FormGroup>
                                        <label className="control-label" htmlFor="executeFromDate">
                                            From Date
                                        </label>
                                        <div className="mb-2">
                                            <Datetime
                                                locale="en-gb"
                                                timeFormat={'HH:mm'}
                                                closeOnClickOutside={true}
                                                closeOnSelect={true}
                                                className="z-index-2"
                                                dateFormat={DATE_TIME_FORMAT.DATE}
                                                value={executeFromDate}
                                                onChange={(e: any) => {
                                                    if (moment.isMoment(e)) {
                                                        let errorObject;
                                                        errorObject = {
                                                            ...error,
                                                            execute_from_date: '',
                                                        };
                                                        setExecuteFromDate(e || '');
                                                        setError(errorObject);
                                                    }
                                                }}
                                            />
                                        </div>
                                        <FormText color="danger">
                                            <b>{error.execute_from_date}</b>
                                        </FormText>
                                    </FormGroup>
                                </Col>
                                <Col md="6">
                                    <FormGroup>
                                        <label className="control-label" htmlFor="executeToDate">
                                            To Date
                                        </label>
                                        <div className="mb-2">
                                            <Datetime
                                                locale="en-gb"
                                                timeFormat={'HH:mm'}
                                                closeOnClickOutside={true}
                                                closeOnSelect={true}
                                                className="z-index-2"
                                                dateFormat={DATE_TIME_FORMAT.DATE}
                                                value={executeToDate}
                                                onChange={(e) => {
                                                    if (moment.isMoment(e)) {
                                                        let errorObject;
                                                        errorObject = {
                                                            ...error,
                                                            execute_to_date: '',
                                                        };
                                                        setExecuteToDate(e || '');
                                                        setError(errorObject);
                                                    }
                                                }}
                                            />
                                        </div>
                                        <FormText color="danger">
                                            <b>{error.execute_to_date}</b>
                                        </FormText>
                                    </FormGroup>
                                </Col>
                            </Row>
                        </div>
                        <div></div>
                    </ModalBody>
                    <ModalFooter>
                        <Button className="btn btn-info" onClick={executeCall}>
                            Execute
                        </Button>
                        <Button color="dark" onClick={toggleModal}>
                            Cancel
                        </Button>
                    </ModalFooter>
                </Modal>
            )}
        </>
    )
}
export default Grid;