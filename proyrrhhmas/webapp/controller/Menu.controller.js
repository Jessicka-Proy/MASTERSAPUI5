sap.ui.define([
    "sap/ui/core/mvc/Controller"
], function (Controller) {
    "use strict";
    return Controller.extend("logaligroup.proyrrhhmas.controller.Menu", {
        onInit: function () {

        },

        onAfterRendering: function () {
            // Error en el framework : Al agregar la dirección URL de "Firmar pedidos", el componente GenericTile debería navegar directamente a dicha URL,
	    	// pero no funciona en la version 1.78. Por tanto, una solución  encontrada es eliminando la propiedad id del componente por jquery
            var genericTileFirmarPedido = this.byId("linkFirmarPedido");
            //Id del dom
            var idGenericTileFirmarPedido = genericTileFirmarPedido.getId();
            //Se vacia el id
            jQuery("#" + idGenericTileFirmarPedido)[0].id = "";
        },

        navToCrearEmpleado: function() {
            var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
            oRouter.navTo("RouteCrearEmpleado",{},false);
        }

    });
});