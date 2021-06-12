// @ts-nocheck
sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/routing/History",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/core/Control"
],
	/**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     * @param {typeof sap.ui.model.Filter} Filter
     * @param {typeof sap.ui.model.FilterOperator} FilterOperator
     */
    function (Controller, History, Filter, FilterOperator) {
        "use strict";
        function onInit() {
            this._splitAppEmpleados = this.byId("splitAppEmpleados");
        }

        function onBack(oEvent) {
            var oHistory = History.getInstance();
            var sPreviousHash = oHistory.getPreviousHash();

            if (sPreviousHash !== undefined) {
                window.history.go(-1);
            } else {
                var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
                oRouter.navTo("RouteMenu", true);
            }
        }

        function onSearchEmpleados(oEvent) {
            var filters = [];
            var oList = this.getView().byId("ListEmpleados");
            var oBinding = oList.getBinding("items");
            var sQuery = oEvent.getParameter("query");
            if (sQuery) {
                filters.push(new Filter("FirstName", FilterOperator.Contains, sQuery));
                oBinding.filter(filters);
            } else {
                filters = [];
                oBinding.filter(filters);
            }
        }

        function onSelectEmpleados(oEvent) {
            //Se navega al detalle del empleado
            this._splitAppEmpleados.to(this.createId("detalleEmpleado"));
            var oContext = oEvent.getParameter("listItem").getBindingContext("odataEmployees");
            //Se almacena el usuario seleccionado
            this.EmployeeId = oContext.getProperty("EmployeeId");
            var odetalleEmpleado = this.byId("detalleEmpleado");
            //Se bindea a la vista con la entidad Users y las claves del id del empleado y el id del alumno
            odetalleEmpleado.bindElement("odataEmployees>/Users(EmployeeId='" + this.EmployeeId + "',SapId='" + this.getOwnerComponent().SapId + "')");

        }

        function onFileBeforeUpload(oEvent) {
            let fileName = oEvent.getParameter("fileName");
            let oCustomerHeaderSlug = new sap.m.UploadCollectionParameter({
                name: "slug",
                value: this.getOwnerComponent().SapId + ";" + this.EmployeeId + ";" + fileName
            });
            oEvent.getParameters().addHeaderParameter(oCustomerHeaderSlug);
        }

        function onFileChange(oEvent) {
            let oUplodCollection = oEvent.getSource();
            // Header Token CSRF - Cross-site request forgery
            let oCustomerHeaderToken = new sap.m.UploadCollectionParameter({
                name: "x-csrf-token",
                value: this.getView().getModel("odataEmployees").getSecurityToken()
            });
            oUplodCollection.addHeaderParameter(oCustomerHeaderToken);
        }

        function onFileUploadComplete(oEvent) {
            oEvent.getSource().getBinding("items").refresh();
        }

        function onFileDeleted(oEvent) {
            var oUploadCollection = oEvent.getSource();
            var sPath = oEvent.getParameter("item").getBindingContext("odataEmployees").getPath();
            this.getView().getModel("odataEmployees").remove(sPath, {
                success: function () {
                    oUploadCollection.getBinding("items").refresh();
                },
                error: function () {

                }
            });
        }

        function onDownloadFile(oEvent) {
            var sPath = oEvent.getSource().getBindingContext("odataEmployees").getPath();
            window.open("sap/opu/odata/sap/ZEMPLOYEES_SRV" + sPath + "/$value");
        }

        function onDarBajaEmpleado(oEvent) {
            sap.m.MessageBox.confirm(this.getView().getModel("i18n").getResourceBundle().getText("textoEliminar"), {
                title: this.getView().getModel("i18n").getResourceBundle().getText("confirmar"),
                onClose: function (oAction) {
                    if (oAction === "OK") {
                        //Se llama a la función remove
                        this.getView().getModel("odataEmployees").remove("/Users(EmployeeId='" + this.EmployeeId + "',SapId='" + this.getOwnerComponent().SapId + "')", {
                            success: function (data) {
                                sap.m.MessageToast.show(this.getView().getModel("i18n").getResourceBundle().getText("confirmEliminarUsuario"));
                                //En el detalle vuelve aparecer el texto "Seleccione un empleado"
                                var splitAppEmpleados = this.byId("splitAppEmpleados");
                                splitAppEmpleados.backDetail();
                                //refrescar master list
                                const listBinding = this.byId("ListEmpleados");
                                listBinding.getBinding("items").refresh();
                            }.bind(this),
                            error: function (e) {
                                sap.base.Log.info(e);
                            }.bind(this)
                        });
                    }
                }.bind(this)
            });
        }

        function onAscenderEmpleado(oEvent) {
            if (!this.anscensoDialog) {
                this.anscensoDialog = sap.ui.xmlfragment("logaligroup/proyrrhhmas/fragment/AscenderEmpleado", this);
                this.getView().addDependent(this.anscensoDialog)
            }
            this.anscensoDialog.setModel(new sap.ui.model.json.JSONModel({}), "newAscenso");
            this.anscensoDialog.open();
        }

        function onCancelAscenso(oEvent) {
            this.anscensoDialog.close();
            this.getView().getModel("odataEmployees").refresh();
        }

        function addAscenso(oEvent) {
            var newAscenso = this.anscensoDialog.getModel("newAscenso");
            var oDataAscenso = newAscenso.getData();

            var body = {
                SapId: this.getOwnerComponent().SapId,
                EmployeeId: this.EmployeeId,
                CreationDate: oDataAscenso.CreationDate,
                Ammount: oDataAscenso.Ammount,
                Comments: oDataAscenso.Comments,
            };

            this.getView().setBusy(true);
            this.getView().getModel("odataEmployees").create("/Salaries", body, {
                success: function () {
                    this.getView().setBusy(false);
                    sap.m.MessageToast.show(this.getView().getModel("i18n").getResourceBundle().getText("ascensoCorrecto"));
                    this.onCancelAscenso();
                }.bind(this),
                error: function () {
                    this.getView().setBusy(false);
                    sap.m.MessageToast.show(this.getView().getModel("i18n").getResourceBundle().getText("ascensoErroneo"));
                }.bind(this)
            });
        }

        return Controller.extend("logaligroup.proyrrhhmas.controller.VerEmpleados", {
            onInit: onInit,
            onBack: onBack,
            onSearchEmpleados: onSearchEmpleados,
            onSelectEmpleados: onSelectEmpleados,
            onFileBeforeUpload: onFileBeforeUpload,
            onFileChange: onFileChange,
            onFileUploadComplete: onFileUploadComplete,
            onFileDeleted: onFileDeleted,
            onDownloadFile: onDownloadFile,
            onDarBajaEmpleado: onDarBajaEmpleado,
            onAscenderEmpleado: onAscenderEmpleado,
            onCancelAscenso: onCancelAscenso,
            addAscenso: addAscenso
        });
    });