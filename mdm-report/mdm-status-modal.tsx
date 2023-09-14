import { useEffect, useState } from "react";
import SweetAlert from "react-bootstrap-sweetalert";
import { Button, FormGroup, Input, Label, Modal, ModalBody, ModalFooter, ModalHeader } from "reactstrap";
import NEM12ReportService from "../../services/nem12-report/nem12-report.service";
import { IMDMReportStatusModalProps } from "./mdm-report.model";

const MDMStatusModal = (props: IMDMReportStatusModalProps) => {

    const service = new NEM12ReportService();

    const [isOpen, setIsOpen] = useState<boolean>(props.isOpen);
    const [alert, setAlert] = useState<JSX.Element | null>(null);   // Changed & now working
    const [status, setStatus] = useState<string>('');
    const [modalError, setModalError] = useState<JSX.Element | string>();   // Chnaged but test
    const [flag, setFlag] = useState<boolean>(false)

    const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {  //Changed nut test
        e.target.value && setModalError("")     // Bug Changes
        setStatus(e.target.value)
    }

    const onSaveClick = async () => {
        const { ids, isAll, name } = props;
        let is_active = false;
        if (status === "active") {
            is_active = true
        }
        else {
            is_active = false;
        }
        let requestObject = {};
        if (isAll) {
            requestObject = {
                ids: [],
                is_all: true,
                is_active: is_active,
                name: name || '',
            }
        }
        else {
            requestObject = {
                ids: ids,
                is_all: false,
                is_active: is_active,
                name: name || '',
            }
        }

        let response = {
            status: 200,
            messages: '',
            code: 200,
            data: 0,
        };

        response = await service.UpdateNEM12ReportStatus(requestObject);

        if (response.code === 200) {
            setAlert(
                <div>
                    <SweetAlert
                        success
                        title={response.messages}
                        onConfirm={async () => {
                            setAlert(null);
                            props.toggleSubmitModal();
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
                            setAlert(null);
                            props.toggleCloseModal();
                        }}
                    />
                </div>
            )
        }
    };

    const onSubmit = () => {
        if (status) {
            setModalError('')
            setFlag(true)
        }
        else {
            let modalError = (<p className="text-danger">Please select meter status</p>);
            setModalError(modalError);
        }
    }

    useEffect(() => {
        if (flag) onSaveClick();
    }, [flag])

    return (
        <>
            {alert}
            <Modal isOpen={isOpen} >
                <ModalHeader toggle={props.toggleCloseModal}>NEM12 Report Active/Inactive</ModalHeader>
                <ModalBody>
                    <FormGroup>
                        <FormGroup check inline>
                            <Input
                                type="radio"
                                id="Active"
                                name="customRadio"
                                className="removeOverlap"
                                value="active"
                                onChange={onChange}
                                checked={status === "active"}
                            />
                            <Label check for="Active">
                                Active
                            </Label>
                        </FormGroup>
                        <FormGroup check inline>
                            <Input
                                type="radio"
                                id="Inactive"
                                name="customRadio"
                                className="removeOverlap"
                                value="inactive"
                                onChange={onChange}
                                checked={status === "inactive"}
                            />
                            <Label check for="Inactive">
                                Inactive
                            </Label>
                        </FormGroup>
                    </FormGroup>
                    {modalError}

                </ModalBody>
                <ModalFooter>
                    <Button color="info" type="submit" onClick={onSubmit}>
                        Submit
                    </Button>
                    <Button color="secondary" onClick={props.toggleCloseModal}>
                        Cancel
                    </Button>
                </ModalFooter>
            </Modal>
        </>
    )

}

export default MDMStatusModal;
