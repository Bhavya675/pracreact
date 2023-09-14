import { useEffect, useState, useRef } from "react";
import SweetAlert from "react-bootstrap-sweetalert";
import { SortOrder } from "react-bootstrap-table";
import { Link } from "react-router-dom";
import { CardTitle, Modal, ModalHeader, ModalBody, Row, Col, FormGroup, Button, ModalFooter, CardBody, Input } from "reactstrap";
import DataTable from "../../components/datatable/datatable";
import GridMenuWithRedirect from "../../components/grid-menu-with-redirect";
import NEM12ReportService from "../../services/nem12-report/nem12-report.service";
import { IPaginationParams } from "../../types";
import { API_RESPONSE_CODE, DEFAULT_VALUES, HEADER_CLASS_NAME, METER_GROUP_COLUMNS, ROUTER } from "../../utils";
import { IMDMReportMeterGroupDataTableProps, IGridDataType } from "./mdm-report.model";

const initialPaginationParams = {
    page: DEFAULT_VALUES.PAGE_INDEX - 1,
    pageSize: DEFAULT_VALUES.PAGE_SIZE,
    offset: 0,
    orderBy: 'group_name',
    direction: 'asc',
}

const MeterGroupDataTable = (props: IMDMReportMeterGroupDataTableProps) => {

    const service = new NEM12ReportService();

    const isMounted = useRef<boolean>(false);
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const [alert, setAlert] = useState<JSX.Element | null>(null);
    const [groupName, setGroupName] = useState<string>("");
    const [virtualGroupName, setVirtualGroupName] = useState<string>("");
    const [pagination, setPagination] = useState<IPaginationParams>(initialPaginationParams);
    const [modalPagination, setModalPagination] = useState<IPaginationParams>({ ...initialPaginationParams });
    const [meterGroup, setMeterGroup] = useState<IGridDataType[]>([]);
    const [modalData, setModalData] = useState<IGridDataType[]>([]);
    const [totalCount, setTotalCount] = useState<number>(0);
    const [modalTotalCount, setModalTotalCount] = useState<number>(0);
    const [allMeterChecked, setAllMeterChecked] = useState<boolean>(false);
    const [selectAllChecked, setSelectAllChecked] = useState<boolean>(false);
    const [allModalMeterChecked, setAllModalMeterChecked] = useState<boolean>(false);
    const [modalSelectAllChecked, setModalSelectAllChecked] = useState<boolean>(false);

    const getMeterGroups = async () => {
        const { direction, orderBy, offset, pageSize } = { ...pagination };

        const requestObject = {
            orderBy,
            direction,
            pageIndex: offset,
            pageSize
        }

        const res = (await service.GetMappedNEM12ReportMeterGroups(props.id, requestObject)).data || [];

        if (res && res.length) {
            setMeterGroup(res);
            setTotalCount(res[0].total_length);
        }
        else {
            setMeterGroup([]);
            setTotalCount(0);
        }
        setAllMeterChecked(false)
    }

    const getUnmappedMeterGroups = async () => {
        const { direction, orderBy, offset, pageSize } = { ...modalPagination };

        const requestObj = {
            group_name: virtualGroupName,
            orderBy,
            direction,
            pageIndex: offset,
            pageSize
        }
        const res = (await service.GetUnmappedNEM12ReportMeterGroups(props.id, requestObj)).data || [];

        if (res && res.length) {
            setModalData(res);
            setModalTotalCount(res[0].total_length);
        }
        else {
            setModalData([]);
            setModalTotalCount(0);
        }
        setAllModalMeterChecked(false)
    }

    const prepareGridHeader = () => {
        const columns = [
            {
                Header: (
                    <div className="form-check form-check-inline me-0 checkboxCenter">
                        <Input
                            name="selectAll"
                            checked={allMeterChecked || selectAllChecked}
                            className="form-check-input"
                            type="checkbox"
                            id="selectAll"
                            value=""
                            onChange={(e) => handleAllChecked(e.target.checked)}
                        />
                    </div>
                ),
                id: 'is_checked',
                sortable: false,
                filterable: false,
                width: 70,
                headerClassName: HEADER_CLASS_NAME,
                Cell: ({ original: row, index }: any) => {
                    return (
                        <div className="form-check form-check-inline me-0 checkboxCenter">
                            <Input
                                className="form-check-input"
                                type="checkbox"
                                id=""
                                value=""
                                checked={row.flag || selectAllChecked}
                                onChange={(e) => checkSingleCheckbox(e, index)}
                            />
                        </div>
                    );
                },
            },
            {
                Header: METER_GROUP_COLUMNS.METER_GROUP.HEADER,
                accessor: METER_GROUP_COLUMNS.METER_GROUP.ACCESSOR,
                headerClassName: HEADER_CLASS_NAME,
                sortable: true,
                Cell: ({ original: row }: any) => {
                    return (
                        <div>
                            <Link
                                to={{
                                    pathname: ROUTER.METER_GROUP,
                                }}
                                state={{
                                    referrer: ROUTER.NEM12_REPORT,
                                    recordId: row.id,
                                    id: props.id,
                                    upsertValue: props.upsertValue
                                }}
                                className="a-icon-grid-action linkStyle"
                                title={row.group_name}
                            >
                                {row.group_name}
                            </Link>
                        </div>
                    );
                },
            },
            {
                Header: METER_GROUP_COLUMNS.DESCRIPTION.HEADER,
                accessor: METER_GROUP_COLUMNS.DESCRIPTION.ACCESSOR,
                headerClassName: HEADER_CLASS_NAME,
                Cell: ({ original: row }: any) => {
                    return <span title={row.group_description}>{row.group_description}</span>;
                },
            }, {
                Header: METER_GROUP_COLUMNS.NO_OF_METERS.HEADER,
                accessor: METER_GROUP_COLUMNS.NO_OF_METERS.ACCESSOR,
                headerClassName: HEADER_CLASS_NAME,
                Cell: ({ original: row }: any) => {
                    return <span title={row.no_of_meters}>{row.no_of_meters}</span>;
                },
            },
        ] as any;
        if (!props.isViewMode()) {
            columns.push({
                Header: METER_GROUP_COLUMNS.ACTION.HEADER,
                id: METER_GROUP_COLUMNS.ACTION.ACCESSOR,
                sortable: false,
                filterable: false,
                width: 100,
                headerClassName: 'text-center react-table-grid-header',
                className: 'text-center d-flex justify-content-center removeOverlap',
                Cell: ({ original: row, index }: any) => {
                    return (
                        <GridMenuWithRedirect
                            deleteClick={onDeleteMeterClick}
                            pathname={ROUTER.METER_GROUP}
                            state={{ id: props.id, upsertValue: props.upsertValue }}
                            referrer={ROUTER.NEM12_REPORT}
                            recordId={row.id}
                            moduleName="MeterGroup"
                        />
                    );
                },
            });
        }
        return columns;
    };

    const getMeterGroupHeaderColumns = () => {
        const columns = [
            {
                Header: (
                    <div className="form-check form-check-inline me-0 checkboxCenter">
                        <Input
                            name="select-All-Meter"
                            checked={allModalMeterChecked || modalSelectAllChecked}
                            className="form-check-input"
                            type="checkbox"
                            id="select-All-Meter"
                            value=""
                            onChange={(e) => handleAllModalMeterChecked(e.target.checked)}
                        />
                    </div>
                ),
                id: 'checkbox',
                sortable: false,
                width: 70,
                filterable: false,
                headerClassName: HEADER_CLASS_NAME,
                Cell: ({ original: row, index }: any) => {
                    return (
                        <div className="form-check form-check-inline me-0 checkboxCenter">
                            <Input
                                className="form-check-input"
                                type="checkbox"
                                id=""
                                value=""
                                checked={row.flag || modalSelectAllChecked}
                                onChange={(e) => checkModalSingleCheckbox(e, index)}
                            />
                        </div>
                    );
                },
            },
            {
                Header: METER_GROUP_COLUMNS.METER_GROUP.HEADER,
                accessor: METER_GROUP_COLUMNS.METER_GROUP.ACCESSOR,
                headerClassName: METER_GROUP_COLUMNS,
                Cell: ({ original: row }: any) => {
                    return <span title={row.group_name}>{row.group_name}</span>;
                },
            }, {
                Header: METER_GROUP_COLUMNS.DESCRIPTION.HEADER,
                accessor: METER_GROUP_COLUMNS.DESCRIPTION.ACCESSOR,
                headerClassName: HEADER_CLASS_NAME,
                Cell: ({ original: row }: any) => {
                    return <span title={row.group_description}>{row.group_description}</span>;
                },
            }, {
                Header: METER_GROUP_COLUMNS.NO_OF_METERS.HEADER,
                accessor: METER_GROUP_COLUMNS.NO_OF_METERS.ACCESSOR,
                headerClassName: HEADER_CLASS_NAME,
                Cell: ({ original: row }: any) => {
                    return <span title={row.no_of_meters}>{row.no_of_meters}</span>;
                },
            },
        ] as any;

        return columns;
    }

    const handleAllChecked = (isChecked: boolean) => {
        const GridData = [...meterGroup];
        GridData?.forEach((item: {flag: boolean}) => (item.flag = isChecked));  // Changed & now works
        setMeterGroup(GridData);
        setAllMeterChecked(isChecked);
        setSelectAllChecked(isChecked && selectAllChecked ? false : selectAllChecked);
    };


    const handleAllModalMeterChecked = (isChecked: boolean) => {
        const GridData = [...modalData];
        GridData?.forEach((item: {flag: boolean}) => (item.flag = isChecked)); //Changed & now works
        setModalData(GridData);
        setAllModalMeterChecked(isChecked);
        setModalSelectAllChecked(isChecked && modalSelectAllChecked ? false : modalSelectAllChecked);
    };

    const checkSingleCheckbox = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
        let GridData = [...meterGroup];
        if (GridData[index])
            GridData[index].flag = e.target.checked;

        const selectedLength = (GridData.filter((row) => row.flag === true))?.length;

        if (selectedLength === meterGroup.length)
            setAllMeterChecked(true);
        else
            setAllMeterChecked(false);

        setMeterGroup(GridData);
    };

    const checkModalSingleCheckbox = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
        let GridData = [...modalData];
        if (GridData[index])
            GridData[index].flag = e.target.checked;

        const selectedLength = (GridData.filter((row) => row.flag === true))?.length;

        if (selectedLength === modalData.length)
            setAllModalMeterChecked(true);
        else
            setAllModalMeterChecked(false);

        setModalData(GridData);

    };

    const onDeleteMeterClick = (id: number) => {
        const getMeterId = meterGroup?.find((selectedMeter) => selectedMeter.id === id);
        if (getMeterId) {
            setAlert(
                <div>
                    <SweetAlert
                        customClass="custom-sweet-alert-width-35em custom-sweet-alert"
                        showCancel
                        focusCancelBtn={false}
                        focusConfirmBtn={false}
                        btnSize="md"
                        style={{ fontSize: '10px' }}
                        title="Are you sure you want to remove?"
                        confirmBtnText="Yes"
                        confirmBtnBsStyle="info"
                        onCancel={() => hideAlert()}
                        cancelBtnBsStyle="danger"
                        cancelBtnText="No"
                        onConfirm={async () => {

                            const requestObj = {
                                meter_group_ids: [getMeterId.id],
                                is_all: false
                            };

                            const response = await service.RemoveNEM12ReportMeterGroups(props.id, requestObj);

                            if (response && response.code && response.code === API_RESPONSE_CODE.SUCCESS) {
                                setAlert(
                                    <div>
                                        <SweetAlert
                                            customClass="custom-sweet-alert-width-35em custom-sweet-alert"
                                            success
                                            title="Meter Group(s) removed successfully"
                                            onConfirm={async () => {
                                                let newPagination = { ...pagination };
                                                newPagination = {
                                                    ...newPagination,
                                                    page: DEFAULT_VALUES.PAGE_INDEX - 1,
                                                    pageIndex: DEFAULT_VALUES.PAGE_INDEX - 1,
                                                };
                                                setPagination(newPagination);
                                                hideAlert();
                                            }}
                                        />
                                    </div>
                                )
                            }
                        }}
                    ></SweetAlert>
                </div>
            )
        }
    }

    const handlePageChange = async (page: number, sizePerPage: number) => {
        const offset = page * sizePerPage;
        let newPagination = { ...pagination };
        newPagination = {
            ...newPagination,
            page: page + 1,
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

    const handleModalPageChange = async (page: number, sizePerPage: number) => {
        const offset = page * sizePerPage;
        let newPagination = { ...modalPagination };
        newPagination = {
            ...newPagination,
            page: page + 1,
            offset,
            pageSize: sizePerPage,
            direction: pagination?.direction || '',
            orderBy: pagination?.orderBy || '',
        };
        setModalPagination(newPagination);
    }

    const handleModalSorting = async (order: SortOrder, dataField: string) => {
        let newPagination = { ...modalPagination };
        newPagination = {
            ...newPagination,
            orderBy: dataField,
            direction: order,
            page: DEFAULT_VALUES.PAGE_INDEX,
            offset: DEFAULT_VALUES.OFFSET,
            pageSize: newPagination?.pageSize || DEFAULT_VALUES.PAGE_SIZE,
        };
        setModalPagination(newPagination)
    }

    const onSelectAllMeters = (is_checked: boolean) => {
        if (is_checked) {
            let GridData = [...meterGroup]
            GridData?.forEach((item) => (item.flag = !is_checked));
            setMeterGroup(GridData);
            setSelectAllChecked(is_checked);
            setAllMeterChecked(!is_checked)
        } else {
            setSelectAllChecked(is_checked);
        }
    }

    const handleModalClose = () => {
        setIsOpen(false);
        setModalData([]);
        setGroupName('');
        setVirtualGroupName('');
        setModalSelectAllChecked(false);
        setAllModalMeterChecked(false);
        setModalPagination(initialPaginationParams);
        setModalTotalCount(0);
    }

    const onMeterGroupFieldValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {  //Changed & now works
        setGroupName(e.target.value);
    }

    const onMeterGroupSearchModalKeyPress = (event: any) => {
        if (event.which === 13) {
            onMeterGroupSearchButtonClick(event);
        }
    }
    const onMeterGroupSearchButtonClick = (e: React.MouseEvent<HTMLButtonElement>) => { //Changed & now works
        e.preventDefault();
        let newPagination = { ...modalPagination };
        newPagination = {
            ...newPagination,
            pageIndex: 0,
            offset: 0
        }
        setVirtualGroupName(groupName);
        setModalPagination(newPagination);
    }

    const onMeterGroupClearButtonClick = () => {
        setModalPagination(initialPaginationParams);
        setGroupName('');
        setVirtualGroupName('');
    }

    const onModalSelectAllMeters = (is_checked: boolean) => {
        if (is_checked) {
            let GridData = [...modalData]
            GridData?.forEach((item) => (item.flag = !is_checked));
            setModalData(GridData);
            setModalSelectAllChecked(is_checked);
            setAllModalMeterChecked(!is_checked)
        } else {
            setModalSelectAllChecked(is_checked);
        }
    }

    const hideAlert = () => setAlert(null);

    const handleMeterGroupSave = () => {
        let meter_group_ids = [];
        meter_group_ids = modalData.filter((item) => item.flag);
        allModalMeterChecked
        modalSelectAllChecked

        if (meter_group_ids.length || modalSelectAllChecked) {
            const selectedCount = modalSelectAllChecked ? modalData[0].total_length : meter_group_ids.length;
            const msgTitle = `Are you sure you want to add selected ${selectedCount} meter group(s)`;

            setAlert(
                <div>
                    <SweetAlert
                        customClass="custom-sweet-alert-width-35em custom-sweet-alert"
                        showCancel
                        focusCancelBtn={false}
                        focusConfirmBtn={false}
                        btnSize="md"
                        style={{ fontSize: '10px' }}
                        title={msgTitle}
                        confirmBtnText="Yes"
                        confirmBtnBsStyle="info"
                        onCancel={() => hideAlert()}
                        cancelBtnBsStyle="danger"
                        cancelBtnText="No"
                        onConfirm={async () => {
                            hideAlert();
                            if (modalSelectAllChecked && modalData && modalData.length) {
                                const searchparams = {
                                    group_name: virtualGroupName,
                                    orderBy: modalPagination.orderBy,
                                    direction: modalPagination.direction,
                                    pageIndex: modalPagination.offset,
                                    pageSize: modalData[0].total_length,
                                };

                                const response = ((await service.GetUnmappedNEM12ReportMeterGroups(props.id, searchparams)).data) || [];
                                if (!response.length) {
                                    meter_group_ids = [];
                                } else {
                                    meter_group_ids = response.map((meter: {id: number}) => meter.id);
                                }
                            } else {
                                meter_group_ids = modalData.filter((item) => item.flag).map((meter: {id: number}) => meter.id)
                            }
                            const saveParams = {
                                meter_group_ids
                            };

                            const response = await service.SaveNEM12ReportMeterGroups(props.id, saveParams);

                            if (response && response.code && response.code === API_RESPONSE_CODE.SUCCESS) {
                                setAlert(
                                    <div>
                                        <SweetAlert
                                            customClass="custom-sweet-alert-width-35em custom-sweet-alert"
                                            success
                                            title="Meter Group(s) added successfully"
                                            onConfirm={() => {
                                                handleModalClose();
                                                hideAlert();
                                                let newPagination = { ...pagination };
                                                newPagination = {
                                                    ...newPagination,
                                                    page: 1,
                                                    offset: 0,
                                                    pageSize: newPagination?.pageSize || 10,
                                                    direction: newPagination?.direction || '',
                                                    orderBy: newPagination?.orderBy || '',
                                                };
                                                setPagination(newPagination);
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
                        btnSize="md"
                        style={{ fontSize: '10px' }}
                        title="Please select atleast one meter group."
                        onConfirm={() => hideAlert()}
                        confirmBtnText="Ok"
                        confirmBtnCssClass="btn-info"
                        focusCancelBtn={false}
                        focusConfirmBtn={false}
                    ></SweetAlert>
                </div>
            );
        }
    }

    const modalOpenHandler = () => {
        setIsOpen(true);
        getUnmappedMeterGroups();
    }

    const onRemoveClick = async () => {
        let meterGroups = meterGroup?.filter((item) => item.flag).map((item) => item.id);
        let is_all = false;
        if (selectAllChecked && meterGroups && meterGroups.length > 0) {
            is_all = true;
        }

        if ((selectAllChecked && meterGroup && meterGroup.length) || (meterGroups && meterGroups.length)) {
            let selectedCount = meterGroups?.length;
            if (selectAllChecked && meterGroup && meterGroup.length) selectedCount = meterGroup[0].total_length;
            const msgTitle = `Are you sure you want to remove selected ${selectedCount} Meter Group(s)?`;

            setAlert(
                <div>
                    <SweetAlert
                        customClass="custom-sweet-alert-width-35em custom-sweet-alert"
                        showCancel
                        focusCancelBtn={false}
                        focusConfirmBtn={false}
                        btnSize="md"
                        style={{ fontSize: '10px' }}
                        title={msgTitle}
                        confirmBtnText="Yes"
                        confirmBtnBsStyle="info"
                        onCancel={() => hideAlert()}
                        cancelBtnBsStyle="danger"
                        cancelBtnText="No"
                        onConfirm={async () => {
                            hideAlert();
                            let requestObj: {meter_group_ids: number[], is_all: boolean};   //Changed & now works

                            if (selectAllChecked && meterGroup && meterGroup.length > 0) {

                                requestObj = {
                                    meter_group_ids: [],
                                    is_all: true
                                };

                            }
                            else {
                                requestObj = {
                                    meter_group_ids: meterGroups,
                                    is_all: false
                                };
                            }

                            const response = await service.RemoveNEM12ReportMeterGroups(props.id, requestObj);

                            if (response && response.code && response.code === API_RESPONSE_CODE.SUCCESS) {

                                setAlert(
                                    <div>
                                        <SweetAlert
                                            customClass="custom-sweet-alert-width-35em custom-sweet-alert"
                                            success
                                            title="Meter Group(s) removed successfully"
                                            onConfirm={async () => {
                                                hideAlert();
                                                let newPagination = { ...pagination };
                                                newPagination = {
                                                    ...newPagination,
                                                    offset: DEFAULT_VALUES.OFFSET,
                                                    page: DEFAULT_VALUES.PAGE_INDEX - 1,
                                                    pageIndex: DEFAULT_VALUES.PAGE_INDEX - 1,
                                                };
                                                setPagination(newPagination);
                                                setSelectAllChecked(false);
                                                setAllMeterChecked(false);
                                            }}
                                        />
                                    </div>
                                )
                            }
                        }}
                    ></SweetAlert>
                </div>
            );

        } else {
            setAlert(
                <div>
                    <SweetAlert
                        customClass="custom-sweet-alert-width-35em custom-sweet-alert"
                        btnSize="md"
                        style={{ fontSize: '10px' }}
                        title="Please select atleast one meter group."
                        onConfirm={() => hideAlert()}
                        confirmBtnText="Ok"
                        confirmBtnCssClass="btn-info"
                        focusCancelBtn={false}
                        focusConfirmBtn={false}
                    ></SweetAlert>
                </div>
            );
        }
    }

    const onRowClick = (rowInfo?: {id: number}) => {
        if (rowInfo && typeof props.navigate === 'function') {     // Changed & now works 
            props.navigate(ROUTER.METER_GROUP, {
                state: {
                    referrer: ROUTER.METER_EVENT_REPORT,
                    recordId: rowInfo.id,
                    id: props.id,
                    upsertValue: props.upsertValue
                }
            });
        }
    }

    useEffect(() => {
        if (isMounted.current)
            getMeterGroups();
    }, [pagination]);

    useEffect(() => {
        if (isMounted.current && isOpen) {
            getUnmappedMeterGroups();
        }
    }, [modalPagination]);

    useEffect(() => {
        isMounted.current = true;
        getMeterGroups();
    }, [])

    return (
        <>
            {alert}
            <CardTitle className="p-3 border-bottom mb-0 bg-light">
                <div className="d-flex justify-content-between align-items-center">
                    <h5 className="card-title mb-0">Meter Group</h5>
                    {!props.isViewMode() && (
                        <div className="text-right">
                            <button
                                onClick={modalOpenHandler}
                                type="button" className="btn btn-info me-1">
                                <span>
                                    <i className="fa fa-plus"></i> Add
                                </span>
                            </button>
                            <button
                                onClick={onRemoveClick}
                                type="button"
                                className="btn btn-danger me-1"
                            >
                                <span>
                                    <i className="fa fa-trash"></i> Remove
                                </span>
                            </button>
                        </div>
                    )}

                </div>
            </CardTitle>
            <CardBody>
                <DataTable
                    pageTableKey={'NEM12ReportMeterGroupDatatableKey'}
                    columns={prepareGridHeader()}
                    data={meterGroup || []}
                    rowsPerPage={pagination?.pageSize || 10}
                    currentPage={pagination?.page || 1}
                    totalCount={totalCount}
                    sortColumn={pagination?.orderBy || 'group_name'}
                    sortOrder={pagination?.direction || 'DESC'}
                    handlePageChange={handlePageChange}
                    handleSort={handleSorting}
                    key={Math.random()}
                    displayTotalRecords={true}
                    selectAllRecords={onSelectAllMeters}
                    onRowClick={onRowClick}
                    selectAllChecked={selectAllChecked}
                    isExport={false}
                />
            </CardBody>

            {isOpen &&
                <Modal size="lg" isOpen={isOpen}>
                    <ModalHeader toggle={handleModalClose}>Add Meter Group</ModalHeader>
                    <ModalBody>
                        <Row>
                            <Col md="4">
                                <FormGroup>
                                    <label className="control-label" htmlFor="group_name">
                                        Meter Group
                                    </label>
                                    <div className="mb-2">
                                        <input
                                            type="text"
                                            id="group_name"
                                            name="group_name"
                                            value={groupName}
                                            className="form-control"
                                            onChange={onMeterGroupFieldValueChange}
                                            autoComplete={'off'}
                                            onKeyPress={onMeterGroupSearchModalKeyPress}
                                        />
                                    </div>
                                </FormGroup>
                            </Col>
                            <Col md="4">
                                <label></label>
                                <div className="gap-2 d-flex">
                                    <Button
                                        color="info"
                                        type="button"
                                        className="btn"
                                        onClick={onMeterGroupSearchButtonClick}
                                    >
                                        Search
                                    </Button>
                                    <Button
                                        type="button"
                                        className="btn ml-2"
                                        onClick={onMeterGroupClearButtonClick}
                                    >
                                        Clear
                                    </Button>
                                </div>
                            </Col>
                        </Row>
                        <div className="mt-3">
                            <DataTable
                                pageTableKey={'NEM12ReportMeterGroupDatatablePopupKey'}
                                columns={getMeterGroupHeaderColumns()}
                                data={modalData}
                                checkedRecord
                                handlePageChange={handleModalPageChange}
                                handleSort={handleModalSorting}
                                rowsPerPage={modalPagination.pageSize || 10}
                                currentPage={modalPagination.page || 1}
                                totalCount={modalTotalCount}
                                sortColumn={modalPagination.orderBy || 'group_name'}
                                sortOrder={modalPagination.direction || 'DESC'}
                                displayTotalRecords={true}
                                key={Math.random()}
                                selectAllRecords={onModalSelectAllMeters}
                                selectAllChecked={modalSelectAllChecked}
                                isExport={false}
                            />
                        </div>
                    </ModalBody>
                    <ModalFooter>
                        <Button color="info" onClick={handleMeterGroupSave}>
                            Add & Save
                        </Button>
                        <Button color="secondary" onClick={handleModalClose}>
                            Cancel
                        </Button>
                    </ModalFooter>
                </Modal>
            }
        </>
    )
}
export default MeterGroupDataTable;

