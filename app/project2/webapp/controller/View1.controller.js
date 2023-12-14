sap.ui.define([
    "sap/ui/core/mvc/Controller"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller) {
        "use strict";

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

        return Controller.extend("com.student.upload.project2.controller.View1", {
            onInit: function () {

            },

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
                var oFileUploader = _this.byId("uploader");
                var oElement = sap.ui.getCore().byId(oFileUploader.id);

                // var oFileUploader = byId("uploader")

                // var sam = document.getElementById("UploadDialog--uploader-fu")
                // var oFileUploader = sam;

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
        });
    });
