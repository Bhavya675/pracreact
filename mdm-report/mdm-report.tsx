import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import { Card, Row, Col, CardTitle } from "reactstrap";
import { Can } from "../../ability";
import NEM12ReportService from "../../services/nem12-report/nem12-report.service";
import { ExtendedStore } from "../../types";
import { ACTION, MODULE_PERMISSION, ROUTER, scrollTop } from "../../utils";
import Grid from "./mdm-report-grid";
import { IAddData, IMDMReportProps } from "./mdm-report.model";
import Upsert from "./upsert-mdm-report";

const initialEditData = {
    id: 0,
    name: '',
    report_timezone: '',
    report_period: '',
    period_value: '',
    execution_cron: '',
    from_participant: '',
    registered_participant: '',
    output_container: '',
    description: '',
    data_substitution_type: '',
    is_mdm_status_mapping: false,
    meter_serial: '',
    meter_serial_custom_value: '',
    is_notification_on: true,
    get_notification: '',
    recipient_emails: [],
    user_emails: [],
}

const MDMReport = (props: IMDMReportProps) => {
    const abilities = useSelector((state: ExtendedStore) => state.settings.abilities);

    const addPermission = abilities?.find(
        (ability) => ability.action === MODULE_PERMISSION.NEM12_REPORT.ADD
    );

    const service = new NEM12ReportService();

    const [upsertValue, setUpsertValue] = useState<string>("");
    const [openUpsertView, setOpenUpsertView] = useState<boolean>(false);
    const [referrerURL, setReferrerURL] = useState<string>("");
    const [editData, setEditData] = useState<IAddData>({ ...initialEditData });
    const [rendered, setRendered] = useState<boolean>(false);

    const getPreviousComponentState = () => props.history.state as {referrer: string, id: number, upsertValue: string, recordId: number };  // Changed & now working 

    const upsertToggle = () => {
        const state = getPreviousComponentState();
        if (state && openUpsertView && state.referrer) {
            setReferrerURL(state.referrer);
            setRendered(state.referrer === ROUTER.MDM_REPORT ? true : false);
            setOpenUpsertView(state.referrer === ROUTER.MDM_REPORT ? !openUpsertView : openUpsertView);
        }
        else {
            setOpenUpsertView(!openUpsertView);
            setUpsertValue("");
            setEditData(initialEditData);
            setRendered(true);
        }
    }

    const editMDMReportData = async (id: number, value: string) => {
        const data = (await service.GetNEM12ReportById(id)).data as IAddData;
        const reportData: IAddData = {
            id: id,
            name: data.name,
            report_timezone: data.report_timezone,
            report_period: data.report_period,
            period_value: data.period_value,
            execution_cron: data.execution_cron,
            from_participant: data.from_participant,
            registered_participant: data.registered_participant,
            output_container: data.output_container,
            description: data.description,
            data_substitution_type: data.data_substitution_type,
            is_mdm_status_mapping: false,
            meter_serial: data.meter_serial,
            meter_serial_custom_value: data.meter_serial_custom_value,
            is_notification_on: data.is_notification_on,
            get_notification: data.get_notification,
            recipient_emails: data.recipient_emails,
            user_emails: data.user_emails || [],
        };
        scrollTop();
        setEditData(reportData);
        setOpenUpsertView(!openUpsertView);
        setUpsertValue(value);
    }

    const setMDMPage = async () => {
        const state = getPreviousComponentState();
        window.history.replaceState({}, document.title);
        if (state) {
            if (state.referrer === ROUTER.MDM_REPORT) {
                await editMDMReportData(
                    state.id,
                    state.upsertValue ?? ACTION.VIEW
                )
            } else {
                await editMDMReportData(state.recordId as number, ACTION.VIEW);
            }
        }
        setRendered(true);
    }

    useEffect(() => {
        setMDMPage();
    }, []);

    return (
        <>
            {referrerURL && referrerURL !== ROUTER.MDM_REPORT && (
                <Navigate to={referrerURL} state={{ ...getPreviousComponentState() }} />
            )}

            <Card>
                <Row>
                    <Col md="12">
                        {!openUpsertView ? (
                            <>
                                <CardTitle className="p-3 border-bottom mb-0 bg-light">
                                    <div className="d-flex justify-content-between align-items-center">
                                        <h5 className="card-title mb-0">MDM Report</h5>
                                        {!openUpsertView ? (
                                            <Can I={addPermission?.action} a={addPermission?.subject}>
                                                <button
                                                    onClick={upsertToggle}
                                                    type="button"
                                                    className="btn btn-info"
                                                >
                                                    <span>
                                                        <i className="fa fa-plus"></i> New
                                                    </span>
                                                </button>
                                            </Can>
                                        ) : null}
                                    </div>
                                </CardTitle>
                                {
                                    rendered &&
                                    <Grid
                                        editData={editMDMReportData}
                                    />
                                }
                            </>
                        ) : (
                            <>
                                <Upsert
                                    data={editData}
                                    id={editData.id}
                                    upsertValue={upsertValue}
                                    upsertToggle={upsertToggle}
                                    {...props}
                                />
                            </>
                        )}
                    </Col>
                </Row>
            </Card>
        </>
    )
}
export default MDMReport;