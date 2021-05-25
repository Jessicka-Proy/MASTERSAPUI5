// @ts-nocheck
sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageBox",
    "sap/m/UploadCollectionParameter"
], function (Controller, MessageBox, UploadCollectionParameter) {
    "use strict";
    return Controller.extend("logaligroup.proyrrhhmas.controller.CrearEmpleado", {
        onInit: function () {

        },

        onBeforeRendering: function () {
            this._wizard = this.byId("CrearEmpleadoWizard");
            this._model = new sap.ui.model.json.JSONModel({});
            this.getView().setModel(this._model);
            //Ir al primer paso
            var oFirstStep = this._wizard.getSteps()[0];
            this._wizard.discardProgress(oFirstStep);
            //Subir el scroll al primer paso
            this._wizard.goToStep(oFirstStep);
            //Invalidar el primer paso
            oFirstStep.setValidated(false);
        },

        navtoStep2: function (oEvent) {
            var datosEmpleadoStep = this.byId("DatosEmpleadoStep");
            var tipoEmpleadoStep = this.byId("TipoEmpleadoStep");

            //Se obtiene el tipo según el botón seleccionado con el "CustomData"
            var button = oEvent.getSource();
            var tipoEmpleado = button.data("tipoEmpleado");

            // Gerente : 70000
            // Interno: 24000
            // autonomo : 400
            var Salario, Type;
            switch (tipoEmpleado) {
                case "gerente":
                    Salario = 70000;
                    Type = "2";
                    break;
                case "interno":
                    Salario = 24000;
                    Type = "0";
                    break;
                case "autonomo":
                    Salario = 400;
                    Type = "1";
                    break;
                default:
                    break;
            }
            //Guardar los datos al presionar los botones
            this._model.setData({
                _type: tipoEmpleado,
                _Salario: Salario,
                Type: Type
            });

            //Ir al paso 2
            if (this._wizard.getCurrentStep() === tipoEmpleadoStep.getId()) {
                this._wizard.nextStep();
            } else {
                this._wizard.goToStep(datosEmpleadoStep);
            }

        },

        onCancel: function () {
            MessageBox.confirm(this.getView().getModel("i18n").getResourceBundle().getText("confirmCancelar"), {
                onClose: function (oAction) {
                    if (oAction === "OK") {
                        var wizardNavContainer = this.byId("wizardNavContainer");
                        wizardNavContainer.back();
                        var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
                        oRouter.navTo("RouteMenu", {}, true);
                    }
                }.bind(this)
            });
        },

        validarDNI: function (oEvent) {
            //Si el tipo no es "autonomo"
            if (this._model.getProperty("/_type") !== "autonomo") {
                var dni = oEvent.getParameter("value");
                var number;
                var letter;
                var letterList;
                var regularExp = /^\d{8}[a-zA-Z]$/;
                //Se comprueba que el formato es válido
                if (regularExp.test(dni) === true) {
                    //Número
                    number = dni.substr(0, dni.length - 1);
                    //Letra
                    letter = dni.substr(dni.length - 1, 1);
                    number = number % 23;
                    letterList = "TRWAGMYFPDXBNJZSQVHLCKET";
                    letterList = letterList.substring(number, number + 1);
                    if (letterList !== letter.toUpperCase()) {
                        this._model.setProperty("/_DNIStatus", "Error");
                        this.validarDatosEmpleados();
                    } else {
                        this._model.setProperty("/_DNIStatus", "None");
                        this.validarDatosEmpleados();
                    }
                } else {
                    this._model.setProperty("/_DNIStatus", "Error");
                    this.validarDatosEmpleados();
                }
            }else {
                    this._model.setProperty("/_DNIStatus", "None");
                    this.validarDatosEmpleados();
            }
        },

        validarDatosEmpleados: function (oEvent) {
            var object = this._model.getData();
            this._model.setProperty("/_ValidDatos", "None");

            //Nombre
            if (!object.FirstName) {
                object._NombreStatus = "Error";
                this._model.setProperty("/_ValidDatos", "Error");
            } else {
                object._NombreStatus = "None";
            }

            //Apellidos
            if (!object.LastName) {
                object._ApellidosStatus = "Error";
                this._model.setProperty("/_ValidDatos", "Error");
            } else {
                object._ApellidosStatus = "None";
            }

            //Fecha Incorporación
            if (!object.CreationDate) {
                object._FechaIncorpStatus = "Error";
                this._model.setProperty("/_ValidDatos", "Error");
            } else {
                object._FechaIncorpStatus = "None";
            }

            //DNI
            if (!object.Dni) {
                object._DNIStatus = "Error";
                this._model.setProperty("/_ValidDatos", "Error");
            } else {
                if (this._model.getProperty("/_DNIStatus") === "None") {
                    object._DNIStatus = "None";
                } else {
                    object._DNIStatus = "Error";
                    this._model.setProperty("/_ValidDatos", "Error");
                }
            }

            if (this._model.getProperty("/_ValidDatos") === "None") {
                this._wizard.validateStep(this.byId("DatosEmpleadoStep"));
            } else {
                this._wizard.invalidateStep(this.byId("DatosEmpleadoStep"));
            }

        },

        wizardCompletedHandler: function (oEvent) {
            if (this._model.getProperty("/_ValidDatos") === "None") {
                var wizardNavContainer = this.byId("wizardNavContainer");
                wizardNavContainer.to(this.byId("ResumenEmp"));
                //Datos de los archivos para Información Adicional
                var uploadCollection = this.byId("UploadCollection");
                var files = uploadCollection.getItems();
                var numFiles = uploadCollection.getItems().length;
                this._model.setProperty("/_numFiles", numFiles);
                if (numFiles > 0) {
                    var arrayFiles = [];
                    for (var i in files) {
                        arrayFiles.push({ FileName: files[i].getFileName(), MimeType: files[i].getMimeType() });
                    }
                    this._model.setProperty("/_files", arrayFiles);
                } else {
                    this._model.setProperty("/_files", []);
                }
            } else {
                this._wizard.goToStep(this.byId("DatosEmpleadoStep"));
            }
        },

        _editToStep: function (step) {
            var wizardNavContainer = this.byId("wizardNavContainer");

            var fnAfterNavigate = function () {
                this._wizard.goToStep(this.byId(step));
                wizardNavContainer.detachAfterNavigate(fnAfterNavigate);
            }.bind(this);

            wizardNavContainer.attachAfterNavigate(fnAfterNavigate);
            wizardNavContainer.back();
        },

        editStepOne: function () {
            this._editToStep.bind(this)("TipoEmpleadoStep");
        },

        editStepTwo: function () {
            this._editToStep.bind(this)("DatosEmpleadoStep");
        },

        editStepThree: function () {
            this._editToStep.bind(this)("InfoAdicionalStep");
        },

        onSaveEmployee: function () {
            var json = this.getView().getModel().getData();
            var body = {};
            //Se obtienen aquellos campos que no empicen por "_", ya que son los que vamos a enviar
            for (var i in json) {
                if (i.indexOf("_") !== 0) {
                    body[i] = json[i];
                }
            }
            body.SapId = this.getOwnerComponent().SapId;
            body.UserToSalary = [{
                Ammount: parseFloat(json._Salario).toString(),
                Comments: json.Comments,
                Waers: "EUR"
            }];

            this.getView().setBusy(true);
            this.getView().getModel("odataEmployees").create("/Users", body, {
                success: function (data) {
                    this.getView().setBusy(false);
                    //Se almacena el nuevo usuario
                    this.EmployeeId = data.EmployeeId;
                    sap.m.MessageBox.information(this.oView.getModel("i18n").getResourceBundle().getText("nuevoEmpleado") + ": " + this.EmployeeId, {
                        onClose: function () {
                            var wizardNavContainer = this.byId("wizardNavContainer");
                            wizardNavContainer.back();
                            var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
                            oRouter.navTo("RouteMenu", {}, true);
                        }.bind(this)
                    });
                    this.onStartUpload();
                }.bind(this),
                error: function () {
                    this.getView().setBusy(false);
                }.bind(this)
            });
        },

        onStartUpload: function (ioNum) {
            var that = this;
            var oUploadCollection = that.byId("UploadCollection");
            oUploadCollection.upload();
        },

        onFileChange: function (oEvent) {
            var oUploadCollection = oEvent.getSource();
            // Header Token
            var oCustomerHeaderToken = new sap.m.UploadCollectionParameter({
                name: "x-csrf-token",
                value: this.getView().getModel("odataEmployees").getSecurityToken()
            });
            oUploadCollection.addHeaderParameter(oCustomerHeaderToken);
        },

        onBeforeUploadStart: function (oEvent) {
            var fileName = oEvent.getParameter("fileName");
            var oCustomerHeaderSlug = new UploadCollectionParameter({
                name: "slug",
                value: this.getOwnerComponent().SapId + ";" + this.EmployeeId + ";" + fileName
            });
            oEvent.getParameters().addHeaderParameter(oCustomerHeaderSlug);
        }

    });
});