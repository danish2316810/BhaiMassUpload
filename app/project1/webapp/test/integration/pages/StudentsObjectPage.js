sap.ui.define(['sap/fe/test/ObjectPage'], function(ObjectPage) {
    'use strict';

    var CustomPageDefinitions = {
        actions: {},
        assertions: {}
    };

    return new ObjectPage(
        {
            appId: 'com.student.project1',
            componentId: 'StudentsObjectPage',
            contextPath: '/Students'
        },
        CustomPageDefinitions
    );
});