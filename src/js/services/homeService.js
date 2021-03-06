

app.factory("homeService", function($http, configService, $log){
    var endPoint = configService.endPoint;

    function querySummary(queryInfo, callback){
        var request = $http({
            url : endPoint + "/report/compare/summary",
            method: "POST",
            data : JSON.stringify(queryInfo),
            headers : { "Content-Type" : "multipart/form-data" }
        });

        request.success(function(data){
            callback(data);
        });

        request.error(function(err){
            $log(err);
        });
    }

    function queryChart(queryInfo, callback){
        var request = $http({
            url : endPoint + "/report/compare/chart",
            method : "POST",
            data : JSON.stringify(queryInfo),
            headers : { "Content-Type" : "multipart/form-data" }
        });

        request.success(function(data){
            callback(data);
        });

        request.error(function(err){
            $log.error(err)
        });
    }

    return {
        queryChart : queryChart,
        querySummary : querySummary
    };
});