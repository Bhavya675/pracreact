import { Formik, ErrorMessage } from "formik";
import React, { useEffect, useState } from "react";
import SweetAlert from "react-bootstrap-sweetalert";
import { CardBody, Col, FormGroup, Row, CardTitle, Button, InputGroup, Input, Label } from "reactstrap";
import { ExtendedStore, ITimezone } from "../../types";
import { ACTION, API_ERROR_MESSAGE, API_RESPONSE_CODE, GET_NOTIFICATION, METER_SERIAL, MODULE_PERMISSION, REPORT_PERIOD, TIMEZONES, viewMode, getSelect2CSS, WARNING_MESSAGE, CRON_EXPRESSION_GENERATOR, CUSTOM_PROPERTY, DELETE_WARNING, DATASUBSTITUTION_TYPES } from "../../utils";
import { useSelector } from "react-redux";
import ConfirmationDialog from "../../components/confirmation-dialog";
import ErrorToast from "../../components/error-toast";
import { IMDMData, ISelectOption, IUpsertViewProps, ISubmitMDMData } from "./mdm-report.model";
import MeterDatatable from "./meter-datatable";
import MeterGroupDatatable from "./meter-group-datatable";
import ExportData from "./export-data";
import Select, { SingleValue } from "react-select";
import CreatableSelect from 'react-select/creatable';
import NEM12ReportService from "../../services/nem12-report/nem12-report.service";
import 'react-datetime/css/react-datetime.css';
import WarningTooltip from "../dashboard/warningTooltip";
import MDMStatusMapping from "./mdm-status-mapping";
import { Can } from "../../ability";
import { ClearIndicator } from "../../components/select-clear-indicator/select-clear-indicator";
import { mdmReportSchema } from "../../validations/mdm-report/mdm-report-schema";
import { debug, error } from "console";


const Upsert = (props: IUpsertViewProps) => {

    const service = new NEM12ReportService();

    const abilities = useSelector((state: ExtendedStore) => state.settings.abilities);
    const customizer = useSelector((state: ExtendedStore) => state.customizer.isDark);

    const editPermission = abilities?.find(
        (ability) => ability.action === MODULE_PERMISSION.NEM12_REPORT.EDIT
    );
    const deletePermission = abilities?.find(
        (ability) => ability.action === MODULE_PERMISSION.NEM12_REPORT.DELETE
    );

    const [alert, setAlert] = useState<JSX.Element | null>(null);   // Changed and now working
    const [mdmData, setMdmData] = useState<IMDMData>(props.data as IMDMData);
    const [savedDetails, setSaveDetails] = useState<IMDMData>({} as IMDMData);
    const [isFinish, setIsFinish] = useState<boolean>(false);
    const [upsertValue, setUpsertValue] = useState<string>(props.upsertValue || '');
    const [id, setId] = useState<number>(props.id || 0);
    const [renderConfirm, setRenderConfirm] = useState<boolean>(false);
    const [renderToast, setRenderToast] = useState<boolean>(false);
    const [toastMessage, settoastMessage] = useState<string>('');
    const [allEmailOptions, setAllEmailOptions] = useState<ISelectOption[]>([]);
    const [selectedEmailOptions, setSelectedEmailOptions] = useState<ISelectOption[]>([]);
    const [selectedUserEmailOptions, setSelectedUserEmailOptions] = useState<ISelectOption[]>([]);
    const [selectOptions, setSelectedOptions] = useState<ISelectOption[]>([]);
    const [dataSubstitutionTypes, setDataSubstitutionTypes] = useState<ISelectOption[]>([]);
    const [mdmDataStreamIdentifiers, setMdmDataStreamIdentifiers] = useState<ISelectOption[]>([]);
    const [registerIds, setRegisterIds] = useState<ISelectOption[]>([]);
    const [neM12StatusMappings, setneM12StatusMappings] = useState<ISelectOption[]>([]);
    const [showWarning, setShowWarning] = useState<boolean>(false);


    useEffect(() => {
        setUpsertValue(props.upsertValue);
    }, [props.upsertValue])

    const isViewMode = () => {
        return viewMode(upsertValue);
    };

    const onSubmit = async (e: ISubmitMDMData) => {
        let emailOptions: string[] = [];
        let userEmails: string[] = [];

        selectedEmailOptions.map((option) => {
            emailOptions.push(option.value);
        });

        selectedUserEmailOptions.map((option) => {
            userEmails.push(option.value);
        });

        const addMDMData = {
            id: id,
            name: mdmData.name,
            report_timezone: mdmData.report_timezone,
            report_period: mdmData.report_period,
            period_value: mdmData.period_value,
            execution_cron: mdmData.execution_cron,
            from_participant: mdmData.from_participant,
            registered_participant: mdmData.registered_participant,
            output_container: mdmData.output_container,
            description: mdmData.description,
            data_substitution_type: mdmData.data_substitution_type,
            is_nem12_status_mapping: false,
            meter_serial: mdmData.meter_serial,
            meter_serial_custom_value: mdmData.meter_serial_custom_value,
            is_notification_on: mdmData.is_notification_on,
            get_notification: mdmData.is_notification_on ? 'both' : '',
            recipient_emails: emailOptions,
            user_emails: userEmails,
        };

        let response: any = null;

        if (addMDMData.id) {
            response = await service.UpdateNEM12Report(addMDMData.id, addMDMData).catch((m) => {
                settoastMessage(m.data.message)
                setRenderToast(true)
            });
        } else {
            response = await service.AddNEM12Report(addMDMData).catch((m) => {
                settoastMessage(m.data.message)
                setRenderToast(true)
            });
        }

        if (response && response.code && response.code === API_RESPONSE_CODE.SUCCESS) {
            if (isFinish) {
                setAlert(
                    <div>
                        <SweetAlert
                            success
                            title={response.messages}
                            onConfirm={() => {
                                setId(response.data.id);
                                setSaveDetails({
                                    name: mdmData.name,
                                    report_timezone: mdmData.report_timezone,
                                    report_period: mdmData.report_period,
                                    period_value: mdmData.period_value,
                                    execution_cron: mdmData.execution_cron,
                                    from_participant: mdmData.from_participant,
                                    registered_participant: mdmData.registered_participant,
                                    output_container: mdmData.output_container,
                                    description: mdmData.description,
                                    data_substitution_type: mdmData.data_substitution_type,
                                    meter_serial: mdmData.meter_serial,
                                    meter_serial_custom_value: mdmData.meter_serial_custom_value,
                                    is_notification_on: mdmData.is_notification_on,
                                    get_notification: mdmData.is_notification_on ? 'both' : '',
                                    recipient_emails: mdmData.recipient_emails,
                                    user_emails: mdmData.user_emails,
                                })
                                hideAlert();
                                props.upsertToggle();
                            }}
                        />
                    </div>
                )
            } else {
                setAlert(
                    <div>
                        <SweetAlert
                            success
                            title={response.messages}
                            onConfirm={() => {
                                setId(response.data.id);
                                setSaveDetails({
                                    name: mdmData.name,
                                    report_timezone: mdmData.report_timezone,
                                    report_period: mdmData.report_period,
                                    period_value: mdmData.period_value,
                                    execution_cron: mdmData.execution_cron,
                                    from_participant: mdmData.from_participant,
                                    registered_participant: mdmData.registered_participant,
                                    output_container: mdmData.output_container,
                                    description: mdmData.description,
                                    data_substitution_type: mdmData.data_substitution_type,
                                    meter_serial: mdmData.meter_serial,
                                    meter_serial_custom_value: mdmData.meter_serial_custom_value,
                                    is_notification_on: mdmData.is_notification_on,
                                    get_notification: mdmData.is_notification_on ? 'both' : '',
                                    recipient_emails: mdmData.recipient_emails,
                                    user_emails: mdmData.user_emails,
                                })
                                hideAlert();
                            }}
                        />
                    </div>
                )
            }
        } else {
            settoastMessage(response.messages)
            setRenderToast(true)
        }
    }

    const hideAlert = () => setAlert(null);

    const isDataUpdate = () => {
        return (
            savedDetails.name !== mdmData.name ||
            savedDetails.report_timezone !== mdmData.report_timezone ||
            savedDetails.report_period !== mdmData.report_period ||
            savedDetails.period_value !== mdmData.period_value ||
            savedDetails.execution_cron !== mdmData.execution_cron ||
            savedDetails.from_participant !== mdmData.from_participant ||
            savedDetails.registered_participant !== mdmData.registered_participant ||
            savedDetails.output_container !== mdmData.output_container ||
            savedDetails.description !== mdmData.description ||
            savedDetails.data_substitution_type !== mdmData.data_substitution_type ||
            savedDetails.meter_serial !== mdmData.meter_serial ||
            savedDetails.meter_serial_custom_value !== mdmData.meter_serial_custom_value ||
            savedDetails.is_notification_on !== mdmData.is_notification_on ||
            savedDetails.recipient_emails !== mdmData.recipient_emails ||
            savedDetails.user_emails !== mdmData.user_emails
        );
    }

    const hideDeleteAlert = () => {
        setRenderConfirm(false);
    };

    const onBackButtonClick = () => {
        if (isDataUpdate()) {
            setAlert(
                <div>
                    <SweetAlert
                        customClass="custom-sweet-alert"
                        showCancel
                        focusCancelBtn={false}
                        focusConfirmBtn={false}
                        btnSize="sm"
                        style={{ fontSize: '8px' }}
                        title="Are you sure you want to leave this section? If yes, the changes for this section will be lost."
                        confirmBtnText="Yes"
                        confirmBtnBsStyle="info"
                        onConfirm={() => {
                            setAlert(null);
                            props.upsertToggle();
                        }}
                        cancelBtnBsStyle="danger"
                        cancelBtnText="No"
                        onCancel={() => {
                            setAlert(null);
                        }}
                    ></SweetAlert>
                </div>
            )
        }
        else {
            props.upsertToggle();
        }
    }

    const onYesClick = async () => {
        const response = await service.DeleteNEM12Report(id);
        if (response && response.code && response.code === API_RESPONSE_CODE.SUCCESS) {
            setAlert(
                <div>
                    <SweetAlert
                        success
                        customClass="custom-sweet-alert-width-35em custom-sweet-alert"
                        title={response.messages}
                        onConfirm={async () => {
                            props.upsertToggle();
                        }}
                    />
                </div>
            )

        } else {
            settoastMessage(API_ERROR_MESSAGE);
            setRenderToast(true);
        }
        hideDeleteAlert();
    };

    const editEnable = () => {
        setUpsertValue(ACTION.EDIT)
    };

    const onFieldValueChange = (e: React.ChangeEvent<HTMLInputElement> | React.ChangeEvent<HTMLTextAreaElement>) => {   //Changed and now works
        (e.target.name === 'report_period' && e.target.value === 'hour') ? setShowWarning(true) : setShowWarning(false);
        let Data = { ...mdmData };
        Data = {
            ...Data,
            [e.target.name]: e.target.value
        }
        setMdmData(Data);
    }

    const onMeterSerialPropertyChange = (e: SingleValue<ISelectOption>) => {
        let Data = { ...mdmData };
        Data = {
            ...Data,
            meter_serial_custom_value: e?.value ?? '',  //Changed & now works
        }
        setMdmData(Data);
    }

    const onRadioChange = (e: React.ChangeEvent<HTMLInputElement>) => { // Changed & now works
        let Data = { ...mdmData };
        Data = {
            ...Data,
            get_notification: e.target.value
        }
        setMdmData(Data);
    }

    const onEmailChange = (e: any) => {
        setSelectedEmailOptions(e);
    }

    const onUserEmailChange = (e: any) => {
        setSelectedUserEmailOptions(e);
    }

    const removeReportDataAlert = (e: any) => {
        setRenderConfirm(true);
    }

    const onNotificationSwitchClick = () => {
        let Data = { ...mdmData };
        Data = {
            ...Data,
            is_notification_on: !Data.is_notification_on,
            get_notification: ""
        }
        setMdmData(Data);
        setSelectedEmailOptions([]);
    }

    const getRecipientEmails = async () => {
        const res = (await service.GetRecipientEmails()).data || []
        if (res && res.length) {
            const EmailSelectOptions: ISelectOption[] = [];
            const UserEmailSelectedOption: ISelectOption[] = [];
            const allEmailOptions: ISelectOption[] = [];
            res.map((option: { email: string; user_name: string; }) => {    // Changed & now works
                if (props.data.recipient_emails && props.data.recipient_emails.length > 0 && props.data.recipient_emails.includes(option.email)) {
                    EmailSelectOptions.push({
                        label: option.user_name + ' (' + option.email + ')',
                        value: option.email
                    })
                }
                allEmailOptions.push(
                    {
                        label: option.user_name + ' (' + option.email + ')',
                        value: option.email
                    }
                )
            })

            props.data.user_emails?.map((option) => {
                const UserMail = allEmailOptions?.filter((x: { value: string }) => x.value === option);
                if (UserMail && UserMail.length) {
                    UserEmailSelectedOption.push({
                        label: UserMail[0].label,
                        value: UserMail[0].value
                    })
                }
                else {
                    UserEmailSelectedOption.push({
                        label: option,
                        value: option
                    })
                }
            })

            setSelectedUserEmailOptions(UserEmailSelectedOption);
            setSelectedEmailOptions(EmailSelectOptions);
            setAllEmailOptions(allEmailOptions);
        }
    }

    const getMDMData = async () => {
        const res = (await service.GetNEMData()).data; 
        if (res && res.dataSubstitutionTypes && res.mdmDataStreamIdentifiers && res.neM12StatusMappings && res.registerIds) {
            let dataSubstitutionTypes: ISelectOption[] = [];
            let mdmDataStreamIdentifiers: ISelectOption[] = [];
            let neM12StatusMappings: ISelectOption[] = [];
            let registerIds: ISelectOption[] = [];

            res.dataSubstitutionTypes.map((t: { type: string; short_descriptor: string; }) => {
                dataSubstitutionTypes.push({
                    label: t.type + " - " + t.short_descriptor,
                    value: t.type
                })
            })
            res.mdmDataStreamIdentifiers.map((t: { value: string }) => {    //Changed & now works
                mdmDataStreamIdentifiers.push({
                    label: t.value,
                    value: t.value
                })
            })
            res.neM12StatusMappings.map((t: { metrix_status: string; }) => {    //Changed & now works
                neM12StatusMappings.push({
                    label: t.metrix_status,
                    value: t.metrix_status
                })
            })
            res.registerIds.map((t: { value: string }) => {   //Changed & now works
                registerIds.push({
                    label: t.value,
                    value: t.value
                })
            })
            setDataSubstitutionTypes(dataSubstitutionTypes);
            setMdmDataStreamIdentifiers(mdmDataStreamIdentifiers);
            setneM12StatusMappings(neM12StatusMappings);
            setRegisterIds(registerIds);
        }
    }

    const getMeterSerialPropertyName = async () => {
        const gridData = (await service.GetMeterSerialPropertyName()).data || [];
        if (gridData && gridData.length) {

            const selectOptions: ISelectOption[] = [];
            gridData.map((serial: { name: string }) => {     //Changed & now works
                selectOptions.push({
                    value: serial.name,
                    label: serial.name,
                });
            })
            setSelectedOptions(selectOptions);
        }
    };

    useEffect(() => {
        let data = { ...mdmData };
        (props.data.report_period === 'hour') ? setShowWarning(true) : setShowWarning(false)
        data = {
            ...data,
            name: props.data.name,
            report_timezone: props.data.report_timezone,
            report_period: props.data.report_period,
            period_value: props.data.period_value,
            execution_cron: props.data.execution_cron,
            from_participant: props.data.from_participant,
            registered_participant: props.data.registered_participant,
            output_container: props.data.output_container,
            description: props.data.description,
            data_substitution_type: props.data.data_substitution_type,
            meter_serial: props.data.meter_serial,
            meter_serial_custom_value: props.data.meter_serial_custom_value,
            is_notification_on: props.data.is_notification_on,
            get_notification: props.data.get_notification,
            recipient_emails: props.data.recipient_emails,
            user_emails: props.data.user_emails,
        }
        setSaveDetails(data);
        setMdmData(data);
    }, [props]);

    useEffect(() => {
        getRecipientEmails();
        getMeterSerialPropertyName();
        getMDMData();
    }, [])

    let selecteValue = selectOptions.find(
        (item) => item.value === mdmData.meter_serial_custom_value,
    );
    return (
        <>
            {alert}
            <Formik
                initialValues={{
                    name: mdmData.name,
                    report_timezone: mdmData.report_timezone,
                    report_period: mdmData.report_period,
                    period_value: mdmData.period_value,
                    execution_cron: mdmData.execution_cron,
                    from_participant: mdmData.from_participant,
                    registered_participant: mdmData.registered_participant,
                    output_container: mdmData.output_container,
                    description: mdmData.description,
                    data_substitution_type: mdmData.data_substitution_type,
                    meter_serial: mdmData.meter_serial,
                    meter_serial_custom_value: mdmData.meter_serial_custom_value,
                    is_notification_on: mdmData.is_notification_on,
                    get_notification: mdmData.get_notification,
                    recipient_emails: mdmData.recipient_emails,
                    selected_recipient_emails: selectedEmailOptions,
                    user_emails: selectedUserEmailOptions,
                }}
                validationSchema={mdmReportSchema}
                onSubmit={(e) => onSubmit(e)}
            >
                {(props) => {
                    const { handleSubmit, setFieldValue, values, isSubmitting } = props;
                    return (
                        <form onSubmit={handleSubmit} noValidate autoComplete="off">
                            <CardTitle className="p-3 border-bottom mb-0 bg-light">
                                <div className="d-flex justify-content-between align-items-center">
                                    <h5 className="card-title mb-0">MDM Report</h5>
                                    <div className="d-flex flex-row">
                                        {upsertValue === ACTION.VIEW ? (
                                            <>
                                                <Can I={editPermission?.action} a={editPermission?.subject}>
                                                    <button
                                                        onClick={editEnable}
                                                        type="button"
                                                        className="btn btn-info me-1"
                                                    >
                                                        <span>
                                                            <i className="fa fa-edit"></i> Edit
                                                        </span>
                                                    </button>
                                                </Can>
                                                <Can I={deletePermission?.action} a={deletePermission?.subject}>
                                                    <button
                                                        onClick={(e) => removeReportDataAlert(e)}
                                                        type="button"
                                                        className="btn btn-danger me-1"
                                                    >
                                                        <span>
                                                            <i className="fa fa-trash"></i> Delete
                                                        </span>
                                                    </button>
                                                </Can>
                                            </>
                                        ) : (
                                            <>
                                                <Button
                                                    type="submit"
                                                    color="primary"
                                                    className="btn btn-info me-1"
                                                    disabled={isSubmitting}
                                                >
                                                    {isSubmitting && !isFinish ? (
                                                        <i className="fas fa-spinner fa-spin"></i>
                                                    ) : (
                                                        <i className="fa fa-check"></i>
                                                    )}{' '}
                                                    {id > 0 ? 'Save' : 'Save & Add Details'}
                                                </Button>
                                                <Button
                                                    color="primary"
                                                    type="submit"
                                                    className="btn btn-secondary-info me-1"
                                                    disabled={isSubmitting}
                                                    onClick={() => setIsFinish(true)}
                                                >
                                                    {isSubmitting && isFinish ? (
                                                        <>
                                                            <i className="fas fa-spinner fa-spin"></i>
                                                        </>
                                                    ) : (
                                                        <i className="fa fa-check"></i>
                                                    )}{' '}
                                                    Save & Finish
                                                </Button>
                                            </>
                                        )}
                                        <button
                                            onClick={onBackButtonClick}
                                            type="button"
                                            className="btn btn-secondary"
                                        >
                                            <span>
                                                <i className="fa fa-arrow-left"></i> Back
                                            </span>
                                        </button>
                                    </div>
                                </div>
                            </CardTitle>
                            <CardBody>
                                <div>
                                    <Row>
                                        <Col md="6">
                                            <FormGroup>
                                                <label htmlFor="name" className="control-label">
                                                    Name *
                                                </label>
                                                <div className="mb-1">
                                                    <input
                                                        type="text"
                                                        id="name"
                                                        name="name"
                                                        value={values.name}
                                                        className="form-control"
                                                        placeholder="Name"
                                                        onChange={(value) => {
                                                            setFieldValue('name', value.target.value);
                                                            onFieldValueChange(value);
                                                        }}
                                                        disabled={isViewMode()}
                                                    />
                                                </div>
                                                <ErrorMessage name="name" component="div" className="text-danger" />
                                            </FormGroup>
                                        </Col>
                                        <Col md="6">
                                            <FormGroup>
                                                <label htmlFor="report_timezone" className="control-label">
                                                    Report Output and Schedule Timezone *
                                                </label>
                                                <div className="mb-1">
                                                    <InputGroup>
                                                        <Input
                                                            type="select"
                                                            className="form-select"
                                                            name="report_timezone"
                                                            id="report_timezone"
                                                            value={values.report_timezone}
                                                            onChange={(value) => {
                                                                setFieldValue(
                                                                    'report_timezone',
                                                                    value.target.value ? value.target.value : null,
                                                                );
                                                                onFieldValueChange(value);
                                                            }}
                                                            disabled={isViewMode()}
                                                        >
                                                            <option value={''}>Select Timezone</option>
                                                            {TIMEZONES.map((data: ITimezone) => (
                                                                <option key={data.value} value={data.value}>{data.value}</option>
                                                            ))}
                                                        </Input>
                                                    </InputGroup>
                                                </div>
                                                <ErrorMessage
                                                    name="report_timezone"
                                                    component="div"
                                                    className="text-danger"
                                                />
                                            </FormGroup>
                                        </Col>
                                    </Row>

                                    <Row className="mt-2">
                                        <Col md="6">
                                            <FormGroup>
                                                <label htmlFor="report_period" className="control-label">
                                                    Report Period *
                                                </label>
                                                <Row>
                                                    <Col md="6">
                                                        <div className="mb-1">
                                                            <Input
                                                                type="select"
                                                                className="form-select"
                                                                name="report_period"
                                                                id="report_period"
                                                                value={values.report_period}
                                                                onChange={(value) => {
                                                                    setFieldValue(
                                                                        'report_period',
                                                                        value.target.value && value.target.value,
                                                                    );
                                                                    onFieldValueChange(value)
                                                                }}
                                                                disabled={isViewMode()}
                                                            >
                                                                <option value={''}>Select</option>
                                                                {REPORT_PERIOD.map((data: { value: string, label: string }) => (  //Changed & now works
                                                                    <option key={data.value} value={data.value}>{data.label}</option>
                                                                ))}
                                                            </Input>
                                                        </div>
                                                        <ErrorMessage
                                                            name="report_period"
                                                            component="div"
                                                            className="text-danger"
                                                        />
                                                    </Col>
                                                    <Col md="6">
                                                        <div className="mb-1">
                                                            <input
                                                                type="text"
                                                                id="period_value"
                                                                name="period_value"
                                                                value={values.period_value}
                                                                className="form-control"
                                                                placeholder="Enter Value"
                                                                onChange={(value) => {
                                                                    setFieldValue(
                                                                        'period_value',
                                                                        value.target.value ? value.target.value : null,
                                                                    );
                                                                    onFieldValueChange(value)
                                                                }}
                                                                disabled={isViewMode()}
                                                            />
                                                        </div>
                                                        <ErrorMessage
                                                            name="period_value"
                                                            component="div"
                                                            className="text-danger"
                                                        />
                                                    </Col>
                                                </Row>
                                            </FormGroup>
                                        </Col>
                                        <Col md="6">
                                            <FormGroup>
                                                <label htmlFor="execution_cron" className="control-label">
                                                    Cron Expression * &nbsp;
                                                    <a
                                                        href={CRON_EXPRESSION_GENERATOR}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="cron-tooltip"
                                                    >
                                                        <i className="fa fa-question-circle"></i>
                                                    </a>
                                                    {showWarning ? (
                                                        <>
                                                            <WarningTooltip id="cronWarning" message={WARNING_MESSAGE} size={'ms-1'} manualWidth={'400px'} />
                                                        </>
                                                    ) : null}
                                                </label>
                                                <div className="mb-1">
                                                    <input
                                                        type="text"
                                                        id="execution_cron"
                                                        name="execution_cron"
                                                        value={values.execution_cron}
                                                        className="form-control"
                                                        placeholder="Cron Expression"
                                                        onChange={(value) => {
                                                            setFieldValue(
                                                                'execution_cron',
                                                                value.target.value ? value.target.value : null,
                                                            );
                                                            onFieldValueChange(value)
                                                        }}
                                                        disabled={isViewMode()}
                                                    />
                                                </div>
                                                <ErrorMessage
                                                    name="execution_cron"
                                                    component="div"
                                                    className="text-danger"
                                                />
                                            </FormGroup>
                                        </Col>
                                    </Row>

                                    <Row className="mt-2">
                                        <Col md="6">
                                            <FormGroup>
                                                <label htmlFor="from_participant" className="control-label">
                                                    From Participant *
                                                </label>
                                                <div className="mb-1">
                                                    <input
                                                        type="text"
                                                        id="from_participant"
                                                        name="from_participant"
                                                        value={values.from_participant}
                                                        className="form-control"
                                                        placeholder="From Participant"
                                                        onChange={(value) => {
                                                            setFieldValue(
                                                                'from_participant',
                                                                value.target.value ? value.target.value : null,
                                                            );
                                                            onFieldValueChange(value)
                                                        }}
                                                        disabled={isViewMode()}
                                                    />
                                                </div>
                                                <ErrorMessage
                                                    name="from_participant"
                                                    component="div"
                                                    className="text-danger"
                                                />
                                            </FormGroup>
                                        </Col>
                                        <Col md="6">
                                            <FormGroup>
                                                <label htmlFor="registered_participant" className="control-label">
                                                    Registered Participant *
                                                </label>
                                                <div className="mb-1">
                                                    <input
                                                        type="text"
                                                        id="registered_participant"
                                                        name="registered_participant"
                                                        value={values.registered_participant}
                                                        className="form-control"
                                                        placeholder="Registered Participant"
                                                        onChange={(value) => {
                                                            setFieldValue(
                                                                'registered_participant',
                                                                value.target.value ? value.target.value : null,
                                                            );
                                                            onFieldValueChange(value);
                                                        }}
                                                        disabled={isViewMode()}
                                                    />
                                                </div>
                                                <ErrorMessage
                                                    name="registered_participant"
                                                    component="div"
                                                    className="text-danger"
                                                />
                                            </FormGroup>
                                        </Col>
                                    </Row>

                                    <Row className="mt-2">
                                        <Col md="6">
                                            <FormGroup>
                                                <label htmlFor="data_substitution_type" className="control-label">
                                                    Data Substitution Type *
                                                </label>
                                                <div className="mb-1">
                                                    <InputGroup>
                                                        <Input
                                                            type="select"
                                                            className="form-select"
                                                            name="data_substitution_type"
                                                            id="data_substitution_type"
                                                            value={values.data_substitution_type}
                                                            onChange={(value) => {
                                                                setFieldValue(
                                                                    'data_substitution_type',
                                                                    value.target.value ? value.target.value : null,
                                                                );
                                                                onFieldValueChange(value)
                                                            }}
                                                            disabled={isViewMode()}
                                                        >
                                                            <option value={''}>Select</option>
                                                            {dataSubstitutionTypes.map((data) => (
                                                                <option key={data.value} value={data.value} disabled={!(DATASUBSTITUTION_TYPES.includes(data.value))}>{data.label}</option>
                                                            ))}
                                                        </Input>
                                                    </InputGroup>
                                                </div>
                                                <ErrorMessage
                                                    name="data_substitution_type"
                                                    component="div"
                                                    className="text-danger"
                                                />
                                            </FormGroup>
                                        </Col>
                                        <Col md={values.meter_serial === CUSTOM_PROPERTY ? 3 : 6} >
                                            <FormGroup>
                                                <label htmlFor="meter_serial" className="control-label">
                                                    Meter Serial *
                                                </label>
                                                <div className="mb-1">
                                                    <InputGroup>
                                                        <Input
                                                            type="select"
                                                            className="form-select"
                                                            name="meter_serial"
                                                            id="meter_serial"
                                                            value={values.meter_serial}
                                                            onChange={(value) => {
                                                                setFieldValue(
                                                                    'meter_serial',
                                                                    value.target.value ? value.target.value : null,
                                                                );
                                                                onFieldValueChange(value)
                                                            }}
                                                            disabled={isViewMode()}
                                                        >
                                                            <option value={''}>Select Meter Serial</option>
                                                            {METER_SERIAL.map((data: { value: string, label: string }) => (   //Chnaged & now works
                                                                <option key={data.value} value={data.value}>{data.label}</option>
                                                            ))}

                                                        </Input>
                                                    </InputGroup>
                                                </div>
                                                <ErrorMessage
                                                    name="meter_serial"
                                                    component="div"
                                                    className="text-danger"
                                                />
                                            </FormGroup>
                                        </Col>
                                        {mdmData.meter_serial === CUSTOM_PROPERTY ? (
                                            <Col md="3">
                                                <FormGroup>
                                                    <label htmlFor="meter_serial_custom_value" className="control-label">
                                                        Meter Serial Custom Property *
                                                    </label>
                                                    <Select
                                                        closeMenuOnSelect={true}
                                                        options={selectOptions}
                                                        styles={getSelect2CSS(customizer)}
                                                        value={selecteValue}
                                                        inputId="meter_serial_custom_value"
                                                        name="meter_serial_custom_value"
                                                        isDisabled={isViewMode()}
                                                        placeholder={'Custom Property'}
                                                        onChange={(value) => {
                                                            setFieldValue('meter_serial_custom_value', value ? value.value : null);
                                                            onMeterSerialPropertyChange(value);
                                                        }}
                                                    />
                                                    <ErrorMessage
                                                        name="meter_serial_custom_value"
                                                        component="div"
                                                        className="text-danger"
                                                    />
                                                </FormGroup>

                                            </Col>
                                        ) : null}
                                    </Row>

                                    <Row className="mt-2">
                                        <Col>
                                            <FormGroup>
                                                <label htmlFor="output_container" className="control-label">
                                                    Output Container *
                                                </label>
                                                <div className="mb-1">
                                                    <input
                                                        type="text"
                                                        id="output_container"
                                                        name="output_container"
                                                        value={values.output_container}
                                                        className="form-control"
                                                        placeholder="Output Container"
                                                        onChange={(value) => {
                                                            setFieldValue(
                                                                'output_container',
                                                                value.target.value ? value.target.value : '',
                                                            );
                                                            onFieldValueChange(value)
                                                        }}
                                                        disabled={isViewMode()}
                                                    />
                                                </div>
                                            </FormGroup>
                                            <ErrorMessage name="output_container" component="div" className="text-danger" />
                                        </Col>
                                    </Row>

                                    <Row className="mt-2">
                                        <Col md={12}>
                                            <FormGroup>
                                                <label htmlFor="user_emails" className="control-label">
                                                    Email Sharing *
                                                </label>
                                                <div className="mb-1">
                                                    <CreatableSelect
                                                        closeMenuOnSelect={true}
                                                        components={{ ClearIndicator }}
                                                        styles={getSelect2CSS(customizer)}
                                                        isMulti
                                                        isClearable
                                                        options={allEmailOptions}
                                                        inputId="user_emails"
                                                        name="user_emails"
                                                        value={values.user_emails}
                                                        placeholder={"User Emails"}
                                                        isDisabled={isViewMode()}
                                                        onChange={(value) => {
                                                            setFieldValue(
                                                                'user_emails',
                                                                value && value
                                                            );
                                                            onUserEmailChange(value);
                                                        }}
                                                    />
                                                </div>
                                                <ErrorMessage
                                                    name="user_emails"
                                                    component="div"
                                                    className="text-danger"
                                                />
                                            </FormGroup>
                                        </Col>
                                    </Row>
                                    <Row className="mt-2">
                                        <Col md={12}>
                                            <FormGroup>
                                                <label htmlFor="description" className="control-label">
                                                    Description
                                                </label>
                                                <div className="mb-2">
                                                    <textarea
                                                        rows={3}
                                                        id="description"
                                                        name="description"
                                                        value={values.description}
                                                        className="form-control"
                                                        placeholder="Description"
                                                        onChange={(value) => {
                                                            setFieldValue(
                                                                'description',
                                                                value.target.value ? value.target.value : null,
                                                            );
                                                            onFieldValueChange(value)
                                                        }}
                                                        disabled={isViewMode()}
                                                    />
                                                </div>
                                            </FormGroup>
                                        </Col>
                                    </Row>

                                </div>
                            </CardBody>
                            <CardTitle className="p-3 border-bottom mb-0 bg-light d-flex justify-content-between align-items-center">
                                Notification
                                <div className="d-flex flex-row">
                                    <div className="form-check form-switch">
                                        <input
                                            type="checkbox"
                                            className="form-check-input"
                                            name="is_notification_on"
                                            checked={mdmData.is_notification_on}
                                            onChange={(value) => {
                                                setFieldValue('is_notification_on', !mdmData.is_notification_on)
                                                onNotificationSwitchClick()
                                            }}
                                            disabled={isViewMode()}
                                        />
                                    </div>
                                </div>
                            </CardTitle>
                            {mdmData.is_notification_on && (
                                <CardBody>
                                    <Row>
                                        <Col md={12}>
                                            <FormGroup>
                                                <label className="control-label me-3" htmlFor="get_notification">
                                                    Get Notification *
                                                </label>
                                                {GET_NOTIFICATION.map((item) => {
                                                    return <FormGroup check inline key={item.value}>
                                                        <Input
                                                            type="radio"
                                                            id={item.value}
                                                            name="get_notification"
                                                            className="removeOverlap"
                                                            value={item.value}
                                                            checked={mdmData.get_notification === item.value}
                                                            onChange={(value) => {
                                                                setFieldValue(
                                                                    'get_notification',
                                                                    value.target.value && value.target.value
                                                                );
                                                                onRadioChange(value);
                                                            }}
                                                        />
                                                        <Label check for={item.value}>
                                                            {item.label}
                                                        </Label>
                                                    </FormGroup>
                                                })}
                                                <ErrorMessage
                                                    name="get_notification"
                                                    component="div"
                                                    className="text-danger"
                                                />
                                            </FormGroup>
                                        </Col>
                                    </Row>
                                    <Row className="mt-3">
                                        <Col md="12">
                                            <FormGroup>
                                                <label htmlFor="recipient_emails" className="control-label">
                                                    Recipient Emails *
                                                </label>
                                                <div className="mb-1">
                                                    <Select
                                                        closeMenuOnSelect={true}
                                                        components={{ ClearIndicator }}
                                                        styles={getSelect2CSS(customizer)}
                                                        isMulti
                                                        isClearable
                                                        options={allEmailOptions}
                                                        inputId="recipient_emails"
                                                        name="selected_recipient_emails"
                                                        value={values.selected_recipient_emails}
                                                        placeholder={"Recipient Emails"}
                                                        isDisabled={isViewMode()}
                                                        onChange={(value) => {
                                                            setFieldValue(
                                                                'selected_recipient_emails',
                                                                value && value
                                                            );
                                                            onEmailChange(value);
                                                        }}
                                                    />
                                                </div>
                                            </FormGroup>
                                            <ErrorMessage name="selected_recipient_emails" component="div" className="text-danger" />
                                        </Col>
                                    </Row>
                                </CardBody>
                            )}
                        </form>
                    );
                }}
            </Formik>
            {id > 0 ? (
                <>
                    <MDMStatusMapping
                        {...props}
                        id={id}
                        isViewMode={isViewMode}
                    />
                    <ExportData
                        {...props}
                        id={id}
                        isViewMode={isViewMode}
                        mdmDataStreamIdentifiers={mdmDataStreamIdentifiers}
                        registerIds={registerIds}
                    />
                    <MeterDatatable
                        {...props}
                        id={id}
                        upsertValue={upsertValue}
                        isViewMode={isViewMode}
                    />
                    <MeterGroupDatatable
                        {...props}
                        id={id}
                        isViewMode={isViewMode}
                    />
                </>
            ) : null}

            {renderConfirm && (
                <>
                    <ConfirmationDialog
                        title={DELETE_WARNING}
                        onCancel={hideDeleteAlert}
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
export default Upsert;