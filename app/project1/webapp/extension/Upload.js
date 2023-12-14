sap.ui.define(
    ["sap/m/MessageBox", "sap/m/MessageToast", "sap/ui/core/UIComponent"],
    function (MessageBox, MessageToast, UIComponent) {
        "use strict";

        function _createUploadController(oExtensionAPI) {
            var oUploadDialog;

            function setOkButtonEnabled(bOk) {
                oUploadDialog && oUploadDialog.getBeginButton().setEnabled(bOk);
            }

            function setDialogBusy(bBusy) {
                oUploadDialog.setBusy(bBusy)
            }

            function closeDialog() {
                oUploadDialog && oUploadDialog.close()
            }

            function showError(sMessage) {
                MessageBox.error(sMessage || "Upload failed")
            }

            // TODO: Better option for this?
            function byId(sId) {
                return sap.ui.core.Fragment.byId("UploadDialog", sId);
            }

            return {
                onBeforeOpen: function (oEvent) {
                    oUploadDialog = oEvent.getSource();
                    oExtensionAPI.addDependent(oUploadDialog);
                },

                onAfterClose: function (oEvent) {
                    oExtensionAPI.removeDependent(oUploadDialog);
                    oUploadDialog.destroy();
                    oUploadDialog = undefined;
                },

                onOk: function (oEvent) {
                    setDialogBusy(true)
                    var sam = document.getElementById("UploadDialog--uploader-fu")
                    // var oFileUploader = sap.ui.getCore().byId(sam);
                     // var oFileUploader = byId("uploader")

                    // var sam = document.getElementById("UploadDialog--uploader-fu")
                    // var oFileUploader = sam;
                    // var oElement = sap.ui.getCore().byId(oFileUploader.id);
                    var oFileUploader = byId("uploader");

                    // ************************New addition

                    var headPar = new sap.ui.unified.FileUploaderParameter();
                    headPar.setName('slug');
                    var Entity = "Students";
                    headPar.setValue(Entity);
                    oFileUploader.removeHeaderParameter('slug');
                    oFileUploader.addHeaderParameter(headPar);
                    // var sUploadUri = oExtensionAPI._controller.extensionAPI._controller._oAppComponent.getManifestObject().resolveUri(“./StudentsSrv/ExcelUpload/excel")
                    // oFileUploader.setUploadUrl(sUploadUri);

                    // ****************************End of addition
                    

                   

                    oFileUploader
                        .checkFileReadable()
                        .then(function () {
                            oFileUploader.upload();
                        })
                        .catch(function (error) {
                            showError("The file cannot be read.");
                            setDialogBusy(false)
                        })
                },

                onCancel: function (oEvent) {
                    closeDialog();
                },

                onTypeMismatch: function (oEvent) {
                    var sSupportedFileTypes = oEvent
                        .getSource()
                        .getFileType()
                        .map(function (sFileType) {
                            return "*." + sFileType;
                        })
                        .join(", ");

                    showError(
                        "The file type *." +
                        oEvent.getParameter("fileType") +
                        " is not supported. Choose one of the following types: " +
                        sSupportedFileTypes
                    );
                },

                onFileAllowed: function (oEvent) {
                    setOkButtonEnabled(true)
                },

                onFileEmpty: function (oEvent) {
                    setOkButtonEnabled(false)
                },

                onUploadComplete: function (oEvent) {
                    var iStatus = oEvent.getParameter("status");
                    var oFileUploader = oEvent.getSource()

                    oFileUploader.clear();
                    setOkButtonEnabled(false)
                    setDialogBusy(false)

                    if (iStatus >= 400) {
                        var oRawResponse = JSON.parse(oEvent.getParameter("responseRaw"));
                        showError(oRawResponse && oRawResponse.error && oRawResponse.error.message);
                    } else {
                        MessageToast.show("Uploaded successfully");
                        oExtensionAPI.refresh()
                        closeDialog();
                    }
                }
            };
        }

        return {
            // break;
            showUploadDialog: function (oBindingContext, aSelectedContexts) {
                this.loadFragment({
                    id: "UploadDialog",
                    name: "com.student.project1.extension.UploadDialog",
                    controller: _createUploadController(this)
                }).then(function (oDialog) {
                    oDialog.open();
                });
            }
        };
    }
);