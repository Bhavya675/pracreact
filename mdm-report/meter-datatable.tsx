import { useEffect, useRef, useState } from "react";
import { SortOrder } from "react-bootstrap-table";
import { Link } from "react-router-dom";
import { CardTitle, Modal, ModalHeader, ModalBody, Row, Col, FormGroup, Button, ModalFooter, CardBody, Input } from "reactstrap";
import DataTable from "../../components/datatable/datatable";
import { Can } from '../../ability';
import SweetAlert from "react-bootstrap-sweetalert";
import { useSelector } from "react-redux";
import { API_RESPONSE_CODE, DEFAULT_VALUES, HEADER_CLASS_NAME, METER_COLUMNS, MODULE_PERMISSION, ROUTER } from "../../utils";
import { ExtendedStore, IPaginationParams } from "../../types";
import GridMenuWithRedirect from "../../components/grid-menu-with-redirect";
import { IMeterSearchParams, IMDMReportMeterDataTableGridData, IMDMReportMeterDataTableProps, IGridDataType } from "./mdm-report.model";
import NEM12ReportService from "../../services/nem12-report/nem12-report.service";

const initialPaginationParams = {
    page: DEFAULT_VALUES.PAGE_INDEX - 1,
    pageSize: DEFAULT_VALUES.PAGE_SIZE,
    offset: 0,
    orderBy: 'meter_id',
    direction: 'asc',
}

const initialSearchParams = {
    meter_property_number: "",
    meter_serial_number: "",
    meter_name: "",
    nmi: "",
    property_name: "",
    customer_name: "",
}

const MeterDataTable = (props: IMDMReportMeterDataTableProps) => {

    const service = new NEM12ReportService();

    const abilities = useSelector((state: ExtendedStore) => state.settings.abilities);

    const isMounted = useRef<boolean>(false);
    const [alert, setAlert] = useState<JSX.Element | null>(null);   // Changed & now works
    const [pagination, setPagination] = useState<IPaginationParams>({ ...initialPaginationParams });
    const [modalPagination, setModalPagination] = useState<IPaginationParams>({ ...initialPaginationParams });
    const [meter, setMeter] = useState<IMDMReportMeterDataTableGridData[]>([]);
    const [modalData, setModalData] = useState<IGridDataType[]>([]);
    const [totalCount, setTotalCount] = useState<number>(0);
    const [modalTotalCount, setModalTotalCount] = useState<number>(0);
    const [allMeterChecked, setAllMeterChecked] = useState<boolean>(false);
    const [selectAllChecked, setSelectAllChecked] = useState<boolean>(false);
    const [allModalMeterChecked, setAllModalMeterChecked] = useState<boolean>(false);
    const [modalSelectAllChecked, setModalSelectAllChecked] = useState<boolean>(false);
    const [isOpen, setIsOpen] = useState<boolean>(false)
    const [meterSearchParams, setMeterSearchParams] = useState<IMeterSearchParams>(initialSearchParams);
    const [virtualSearch, SetvirtualSearch] = useState<IMeterSearchParams>(initialSearchParams);

    const getMeters = async () => {
        const { direction, orderBy, offset, pageSize } = { ...pagination };
        const requestObj = {
            orderBy,
            direction,
            pageIndex: offset,
            pageSize
        }

        const res = (await service.GetMappedNEM12ReportMeters(props.id, requestObj)).data || [];

        if (res && res.length) {
            setMeter(res);
            setTotalCount(res[0].total_length);
        }
        else {
            setMeter([]);
            setTotalCount(0);
        }
        setAllMeterChecked(false)
    }

    const getUnmappedMeters = async () => {
        const { direction, orderBy, offset, pageSize } = { ...modalPagination };
        const { meter_property_number, meter_serial_number, meter_name, nmi, property_name, customer_name } = virtualSearch;
        const requestObj = {
            meter_property_number,
            meter_serial_number,
            meter_name,
            nmi,
            property_name,
            customer_name,
            orderBy,
            direction,
            pageIndex: offset,
            pageSize
        }
        const res = (await service.GetUnmappedNEM12ReportMeters(props.id, requestObj)).data || [];

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
        const viewCustomerPermission = abilities?.find(
            (ability) => ability.action === MODULE_PERMISSION.CONFIGURATION.VIEW_CUSTOMER_NAME,
        );
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
                            onChange={(e) => handleAllMeterChecked(e.target.checked)}
                        />
                    </div>
                ),
                id: 'is_checked',
                sortable: false,
                filterable: false,
                width: 70,
                headerClassName: 'react-table-grid-header',
                recordStatusInfo: {
                    columnName: 'active'
                },
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
                Header: METER_COLUMNS.METER_NAME.HEADER,
                accessor: METER_COLUMNS.METER_NAME.ACCESSOR,
                headerClassName: HEADER_CLASS_NAME,
                sortable: true,
                Cell: ({ original: row }: any) => {
                    return (
                        <div>
                            <Link
                                to={{
                                    pathname: ROUTER.METER,
                                }}
                                state={{
                                    referrer: ROUTER.NEM12_REPORT,
                                    recordId: row.id,
                                    id: props.id,
                                    upsertValue: props.upsertValue
                                }}
                                className="a-icon-grid-action linkStyle"
                                title={row.active ? row.meter_id : null}
                            >
                                {row.active === false ? <span data-tip={`${row.meter_id}(Inactive)`}>{row.meter_id}</span> : <span>{row.meter_id}</span>}
                            </Link>
                        </div>
                    );
                },
            },
            {
                Header: METER_COLUMNS.METER_PROPERTY_NUMBER.HEADER,
                accessor: METER_COLUMNS.METER_PROPERTY_NUMBER.ACCESSOR,
                sortable: true,
                headerClassName: HEADER_CLASS_NAME,
                Cell: ({ original: row }: any) => {
                    return <span title={row.meter_property_number}>{row.meter_property_number}</span>;
                },
            },
            {
                Header: METER_COLUMNS.METER_SERIAL_NUMBER.HEADER,
                accessor: METER_COLUMNS.METER_SERIAL_NUMBER.ACCESSOR,
                sortable: true,
                headerClassName: HEADER_CLASS_NAME,
                Cell: ({ original: row }: any) => {
                    return <span title={row.meter_serial_number}>{row.meter_serial_number}</span>;
                },
            },
            {
                Header: METER_COLUMNS.NMI.HEADER,
                accessor: METER_COLUMNS.NMI.ACCESSOR,
                sortable: true,
                headerClassName: HEADER_CLASS_NAME,
                Cell: ({ original: row }: any) => {
                    return <span title={row.nmi}>{row.nmi}</span>;
                },
            },
            {
                Header: METER_COLUMNS.PROPERTY_NAME.HEADER,
                accessor: METER_COLUMNS.PROPERTY_NAME.ACCESSOR,
                sortable: true,
                headerClassName: HEADER_CLASS_NAME,
                Cell: ({ original: row }: any) => {
                    return <span title={row.name}>{row.name}</span>;
                },
            },
        ] as any;  
        if (viewCustomerPermission) {
            columns.push({
                Header: METER_COLUMNS.CUSTOMER_NAME.HEADER,
                accessor: METER_COLUMNS.CUSTOMER_NAME.ACCESSOR,
                headerClassName: HEADER_CLASS_NAME,
                Cell: ({ original: row }: any) => {
                    return <span title={row.customer_name}>{row.customer_name}</span>;
                },
            });
        }
        if (!props.isViewMode()) {
            columns.push({
                Header: 'Action',
                id: 'id',
                sortable: false,
                filterable: false,
                width: 100,
                headerClassName: 'text-center react-table-grid-header',
                className: 'text-center d-flex justify-content-center removeOverlap',
                Cell: ({ original: row }: any) => {
                    return (
                        <GridMenuWithRedirect
                            deleteClick={onDeleteMeterClick}
                            pathname={ROUTER.METER}
                            state={{ id: props.id, upsertValue: props.upsertValue }}
                            referrer={ROUTER.NEM12_REPORT}
                            recordId={row.id}
                            moduleName="Meter"
                        />
                    );
                },
            });
        }
        return columns;
    };

    const getMeterHeaderColumns = () => {
        const viewCustomerPermission = abilities?.find(
            (ability) => ability.action === MODULE_PERMISSION.CONFIGURATION.VIEW_CUSTOMER_NAME,
        );
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
                recordStatusInfo: {
                    columnName: 'active'
                },
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
                Header: METER_COLUMNS.CUSTOMER_NAME.HEADER,
                accessor: METER_COLUMNS.CUSTOMER_NAME.ACCESSOR,
                headerClassName: HEADER_CLASS_NAME,
                Cell: ({ original: row }: any) => {
                    return row.active === false ? <span data-tip={`${row.meter_id}(Inactive)`}>{row.meter_id}</span> : <span title={row.meter_id}>{row.meter_id}</span>
                },
            },
            {
                Header: METER_COLUMNS.METER_PROPERTY_NUMBER.HEADER,
                accessor: METER_COLUMNS.METER_PROPERTY_NUMBER.ACCESSOR,
                headerClassName: HEADER_CLASS_NAME,
                Cell: ({ original: row }: any) => {
                    return <span title={row.meter_property_number}>{row.meter_property_number}</span>;
                },
            },
            {
                Header: METER_COLUMNS.METER_SERIAL_NUMBER.HEADER,
                accessor: METER_COLUMNS.METER_SERIAL_NUMBER.ACCESSOR,
                headerClassName: HEADER_CLASS_NAME,
                Cell: ({ original: row }: any) => {
                    return <span title={row.meter_serial_number}>{row.meter_serial_number}</span>;
                },
            },
            {
                Header: METER_COLUMNS.NMI.HEADER,
                accessor: METER_COLUMNS.NMI.ACCESSOR,
                headerClassName: HEADER_CLASS_NAME,
                Cell: ({ original: row }: any) => {
                    return <span title={row.nmi}>{row.nmi}</span>;
                },
            },
            {
                Header: METER_COLUMNS.PROPERTY_NAME.HEADER,
                accessor: METER_COLUMNS.PROPERTY_NAME.ACCESSOR,
                headerClassName: HEADER_CLASS_NAME,
                Cell: ({ original: row }: any) => {
                    return <span title={row.name}>{row.name}</span>;
                },
            },
        ] as any;
        if (viewCustomerPermission) {
            columns.push({
                Header: METER_COLUMNS.CUSTOMER_NAME.HEADER,
                accessor: METER_COLUMNS.CUSTOMER_NAME.ACCESSOR,
                headerClassName: HEADER_CLASS_NAME,
                Cell: ({ original: row }: any) => {
                    return <span title={row.customer_name}>{row.customer_name}</span>;
                },
            });
        }
        return columns;
    }

    const handleAllMeterChecked = (isChecked: boolean) => {
        const GridData = [...meter];
        GridData?.forEach((item) => (item.flag = isChecked)); //Changed & now works
        setMeter(GridData);
        setAllMeterChecked(isChecked);
        setSelectAllChecked(isChecked && selectAllChecked ? false : selectAllChecked);
    };

    const handleAllModalMeterChecked = (isChecked: boolean) => {
        const GridData = [...modalData];
        GridData?.forEach((item) => (item.flag = isChecked));   //Changed & now works
        setModalData(GridData);
        setAllModalMeterChecked(isChecked);
        setModalSelectAllChecked(isChecked && modalSelectAllChecked ? false : modalSelectAllChecked);
    };

    const onDeleteMeterClick = (id: number) => {

        const getMeterId = meter?.find((selectedMeter) => selectedMeter.id === id);
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
                                meter_ids: [getMeterId.meter_id],
                                is_all: false
                            };

                            const response = await service.RemoveNEM12ReportMeters(props.id, requestObj);

                            if (response && response.code && response.code === API_RESPONSE_CODE.SUCCESS) {
                                setAlert(
                                    <div>
                                        <SweetAlert
                                            customClass="custom-sweet-alert-width-35em custom-sweet-alert"
                                            success
                                            title="Meter(s) removed successfully"
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

    const checkSingleCheckbox = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {    //Changed & now works
        let GridData = [...meter];
        if (GridData[index])
            GridData[index].flag = e.target.checked;

        const selectedLength = (GridData.filter((row) => row.flag === true))?.length;

        if (selectedLength === meter.length)
            setAllMeterChecked(true);
        else
            setAllMeterChecked(false);

        setMeter(GridData);
    };

    const checkModalSingleCheckbox = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {   //Changed & now works
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
            let GridData = [...meter]
            GridData?.forEach((item) => (item.flag = !is_checked));
            setMeter(GridData);
            setSelectAllChecked(is_checked);
            setAllMeterChecked(!is_checked)
        } else {
            setSelectAllChecked(is_checked);
        }
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
    
    const onRemoveClick = async () => {
        const selectedMeterIds = meter?.filter((item) => item.flag).map((item) => item.meter_id);
        const isAllSelected = selectAllChecked && meter && meter.length > 0;
        const selectedCount = isAllSelected ? meter[0].total_length : selectedMeterIds?.length;
    
        if (isAllSelected || (selectedMeterIds && selectedMeterIds.length)) {
            const msgTitle = `Are you sure you want to remove selected ${selectedCount} Meter(s)?`;
    
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
                            let requestObj;
    
                            if (isAllSelected) {
                                requestObj = {
                                    meter_ids: [],
                                    is_all: true,
                                };
                            } else {
                                requestObj = {
                                    meter_ids: selectedMeterIds,
                                    is_all: false,
                                };
                            }
    
                            const response = await service.RemoveNEM12ReportMeters(props.id, requestObj);
    
                            if (response && response.code && response.code === API_RESPONSE_CODE.SUCCESS) {
                                setAlert(
                                    <div>
                                        <SweetAlert
                                            customClass="custom-sweet-alert-width-35em custom-sweet-alert"
                                            success
                                            title="Meter(s) removed successfully"
                                            onConfirm={async () => {
                                                hideAlert();
                                                const newPagination = {
                                                    ...pagination,
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
                                );
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
                        title="Please select at least one meter."
                        onConfirm={() => hideAlert()}
                        confirmBtnText="Ok"
                        confirmBtnCssClass="btn-info"
                        focusCancelBtn={false}
                        focusConfirmBtn={false}
                    ></SweetAlert>
                </div>
            );
        }
    };
    

    const handleModalClose = () => {
        setIsOpen(false);
        setMeterSearchParams({ ...initialSearchParams });
        SetvirtualSearch({ ...initialSearchParams });
        setModalData([]);
        setModalSelectAllChecked(false);
        setAllModalMeterChecked(false);
        setModalPagination(initialPaginationParams);
        setModalTotalCount(0);
    }

    const onMeterFieldValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {   //Chnaged & now works
        let searchObj = { ...meterSearchParams };
        searchObj = {
            ...searchObj,
            [e.target.name]: e.target.value
        }
        setMeterSearchParams(searchObj);
    }
    
    const onMeterSearchModalKeyPress = (event: any) => {
        if (event.which === 13) {
            onMeterSearchButtonClick(event);
        }
    }

    const onMeterSearchButtonClick = (e: React.MouseEvent<HTMLButtonElement>) => {  //Changed & now works
        e.preventDefault();
        let newPagination = { ...modalPagination };
        newPagination = {
            ...newPagination,
            pageIndex: 0,
            offset: 0
        }
        SetvirtualSearch({ ...meterSearchParams })
        setModalPagination(newPagination);
    }

    const hideAlert = () => setAlert(null);

    const handleMeterSave = () => {
        let meter_ids = [];
        meter_ids = modalData.filter((item) => item.flag);
        allModalMeterChecked
        modalSelectAllChecked

        if (meter_ids.length || modalSelectAllChecked) {
            const selectedCount = modalSelectAllChecked ? modalData[0].total_length : meter_ids.length;
            const msgTitle = `Are you sure you want to add selected ${selectedCount} meter(s)`;

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
                                const { meter_property_number, meter_serial_number, meter_name, nmi, property_name, customer_name } = virtualSearch
                                const searchparams = {
                                    meter_property_number,
                                    meter_serial_number,
                                    meter_name,
                                    nmi,
                                    property_name,
                                    customer_name,
                                    orderBy: modalPagination.orderBy,
                                    direction: modalPagination.direction,
                                    pageIndex: modalPagination.offset,
                                    pageSize: modalData[0].total_length,
                                };

                                const response = ((await service.GetUnmappedNEM12ReportMeters(props.id, searchparams)).data) || [];
                                if (!response.length) {
                                    meter_ids = [];
                                } else {
                                    meter_ids = response.map((meter: {meter_id: number}) => meter.meter_id);
                                }
                            } else {
                                meter_ids = modalData.filter((item) => item.flag).map((meter: IGridDataType) => meter.meter_id);
                            }
                            const saveParams = {
                                meter_ids
                            };

                            const response = await service.SaveNEM12ReportMeters(props.id, saveParams);

                            if (response && response.code && response.code === API_RESPONSE_CODE.SUCCESS) {
                                setAlert(
                                    <div>
                                        <SweetAlert
                                            customClass="custom-sweet-alert-width-35em custom-sweet-alert"
                                            success
                                            title="Meter(s) added successfully"
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
                        title="Please select atleast one meter."
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
        getUnmappedMeters();
    }

    const onMeterClearButtonClick = () => {
        setModalPagination({ ...initialPaginationParams });
        setMeterSearchParams({ ...initialSearchParams });
        SetvirtualSearch({ ...initialSearchParams })
    }

    const onRowClick = (rowInfo?: {id: number}) => {
        if (rowInfo  && typeof props.navigate === 'function') {
            props.navigate(ROUTER.METER, {
                state: {
                    referrer: ROUTER.NEM12_REPORT,
                    recordId: rowInfo.id,
                    id: props.id,
                    upsertValue: props.upsertValue
                }
            })
        }
    }

    useEffect(() => {
        if (isMounted.current)
            getMeters();
    }, [pagination]);

    useEffect(() => {
        if (isMounted.current && isOpen) {
            getUnmappedMeters();
        }
    }, [modalPagination]);

    useEffect(() => {
        isMounted.current = true;
        getMeters();
    }, [])

    const viewCustomerPermission = abilities?.find(
        (ability) => ability.action === MODULE_PERMISSION.CONFIGURATION.VIEW_CUSTOMER_NAME,
    );

    return (
        <>
            {alert}
            <CardTitle className="p-3 border-bottom mb-0 bg-light">
                <div className="d-flex justify-content-between align-items-center">
                    <h5 className="card-title mb-0">Meters</h5>
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
                    pageTableKey={'NEM12ReportMeterDatatableKey'}
                    columns={prepareGridHeader()}
                    data={meter || []}
                    rowsPerPage={pagination?.pageSize || 10}
                    currentPage={pagination?.page || 1}
                    totalCount={totalCount}
                    sortColumn={pagination?.orderBy || ''}
                    sortOrder={pagination?.direction || ''}
                    handlePageChange={handlePageChange}
                    handleSort={handleSorting}
                    key={Math.random()}
                    displayTotalRecords={true}
                    selectAllRecords={onSelectAllMeters}
                    selectAllChecked={selectAllChecked}
                    onRowClick={onRowClick}
                    isExport={false}
                />
            </CardBody>

            {
                isOpen &&
                <Modal size="lg" isOpen={isOpen}>
                    <ModalHeader toggle={handleModalClose}>Add Meters</ModalHeader>
                    <ModalBody>
                        <div>
                            <Row>
                                <Col md="6">
                                    <FormGroup>
                                        <label className="control-label" htmlFor="meter_name">
                                            Meter Name
                                        </label>
                                        <div className="mb-2">
                                            <input
                                                type="text"
                                                id="meter_name"
                                                name="meter_name"
                                                value={meterSearchParams.meter_name}
                                                className="form-control"
                                                onChange={onMeterFieldValueChange}
                                                autoComplete={'off'}
                                                onKeyPress={onMeterSearchModalKeyPress}
                                            />
                                        </div>
                                    </FormGroup>
                                </Col>
                                <Col md="6">
                                    <FormGroup>
                                        <label className="control-label" htmlFor="meter_property_number">
                                            Meter Property Number
                                        </label>
                                        <div className="mb-2">
                                            <input
                                                type="text"
                                                id="meter_property_number"
                                                name="meter_property_number"
                                                value={meterSearchParams.meter_property_number}
                                                className="form-control"
                                                onChange={onMeterFieldValueChange}
                                                autoComplete={'off'}
                                                onKeyPress={onMeterSearchModalKeyPress}
                                            />
                                        </div>
                                    </FormGroup>
                                </Col>
                            </Row>
                            <Row>
                                <Col md="6">
                                    <FormGroup>
                                        <label className="control-label" htmlFor="meter_serial_number">
                                            Meter Serial Number
                                        </label>
                                        <div className="mb-2">
                                            <input
                                                type="text"
                                                id="meter_serial_number"
                                                name="meter_serial_number"
                                                value={meterSearchParams.meter_serial_number}
                                                className="form-control"
                                                onChange={onMeterFieldValueChange}
                                                autoComplete={'off'}
                                                onKeyPress={onMeterSearchModalKeyPress}
                                            />
                                        </div>
                                    </FormGroup>
                                </Col>
                                <Col md="6">
                                    <FormGroup>
                                        <label className="control-label" htmlFor="nmi">
                                            NMI
                                        </label>
                                        <div className="mb-2">
                                            <input
                                                type="text"
                                                id="nmi"
                                                name="nmi"
                                                value={meterSearchParams.nmi}
                                                className="form-control"
                                                onChange={onMeterFieldValueChange}
                                                autoComplete={'off'}
                                                onKeyPress={onMeterSearchModalKeyPress}
                                            />
                                        </div>
                                    </FormGroup>
                                </Col>
                            </Row>
                            <Row>
                                <Col md="6">
                                    <FormGroup>
                                        <label className="control-label" htmlFor="property_name">
                                            Property Name
                                        </label>
                                        <div className="mb-2">
                                            <input
                                                type="text"
                                                id="property_name"
                                                name="property_name"
                                                value={meterSearchParams.property_name}
                                                className="form-control"
                                                onChange={onMeterFieldValueChange}
                                                autoComplete={'off'}
                                                onKeyPress={onMeterSearchModalKeyPress}
                                            />
                                        </div>
                                    </FormGroup>
                                </Col>
                                <Can I={viewCustomerPermission?.action} a={viewCustomerPermission?.subject}>
                                    <Col md="6">
                                        <FormGroup>
                                            <label className="control-label" htmlFor="customer_name">
                                                Customer Name
                                            </label>
                                            <div className="mb-2">
                                                <input
                                                    type="text"
                                                    id="customer_name"
                                                    name="customer_name"
                                                    value={meterSearchParams.customer_name}
                                                    className="form-control"
                                                    onChange={onMeterFieldValueChange}
                                                    autoComplete={'off'}
                                                    onKeyPress={onMeterSearchModalKeyPress}
                                                />
                                            </div>
                                        </FormGroup>
                                    </Col>
                                </Can>
                            </Row>
                        </div>
                        <div className="gap-2 d-flex">
                            <Button
                                color="info"
                                type="button"
                                className="btn"
                                onClick={onMeterSearchButtonClick}
                            >
                                Search
                            </Button>
                            <Button type="button" className="btn ml-2" onClick={onMeterClearButtonClick}>
                                Clear
                            </Button>
                        </div>
                        <div className="mt-3">
                            <DataTable
                                pageTableKey={'NEM12ReportMeterDatatablePopupKey'}
                                columns={getMeterHeaderColumns()}
                                data={modalData}
                                checkedRecord
                                handlePageChange={handleModalPageChange}
                                handleSort={handleModalSorting}
                                rowsPerPage={modalPagination.pageSize || 10}
                                currentPage={modalPagination.page || 1}
                                totalCount={modalTotalCount}
                                sortColumn={modalPagination.orderBy || 'meter_id'}
                                sortOrder={modalPagination.direction || 'ASC'}
                                displayTotalRecords={true}
                                key={Math.random()}
                                selectAllRecords={onModalSelectAllMeters}
                                selectAllChecked={modalSelectAllChecked}
                                isExport={false}
                            />
                        </div>
                    </ModalBody>
                    <ModalFooter>
                        <Button color="info" onClick={handleMeterSave}>
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
export default MeterDataTable;