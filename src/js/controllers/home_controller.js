app.controller("homeController", function ($scope, $log, collectionService, homeService, globalService) {

    ///////////////////////////////////////////////////////////
    // ***** PRIVATE ******
    ///////////////////////////////////////////////////////////
    // init default value
    function initDropdown() {
        var d = new DropdownId();

        setDropdown(d.dailyMonth, $scope.months[0].key, $scope.months[0].value);
        setDropdown(d.dailyYear, $scope.years[0].key, $scope.years[0].value);

        setDropdown(d.monthlyFrom, $scope.months[0].key, $scope.months[0].value);
        setDropdown(d.monthlyTo, $scope.months[11].key, $scope.months[11].value);

        var yl = $scope.years.length - 1;
        setDropdown(d.yearlyFrom, $scope.years[0].key, $scope.years[0].value);
        setDropdown(d.yearlyTo, $scope.years[yl].key, $scope.years[yl].value);

        setDropdown(d.timeFrom, $scope.times[9].key, $scope.times[9].value);
        setDropdown(d.timeTo, $scope.times[10].key, $scope.times[10].value);

    }

    function getDropdownValue(id) {
        var value = $(id).dropdown("get value");
        console.log(value);
        if (typeof(value) === "string") return value;
        return ""
    }

    function setDropdown(id, key, value) {
        $(id).dropdown("set value", key).dropdown("set text", value)
    };

    function getScreenWidth() {
        return $(window).width();
    }

    // Collection of dropdown id
    // * Use as object with keyword "new"
    function DropdownId() {
        this.dailyMonth = "#dailyMonth";
        this.dailyYear = "#dailyYear";

        this.monthlyFrom = "#monthlyFrom";
        this.monthlyTo = "#monthlyTo";

        this.yearlyFrom = "#yearlyFrom";
        this.yearlyTo = "#yearlyTo";

        this.timeFrom = "#timeFrom";
        this.timeTo = "#timeTo";

        this.categoryB = "#categoryB";
        this.categoryC = "#categoryC";

        this.product = "#product";
        this.branch = "#branch";

    };

    function queryCallback(data) {
        console.log(data);
        createChart(data.columns, data.touchDatas, data.passDatas);
    }

    function groupCategory() {

        var all = { identifier: "", title: "All" }

        $scope.categoriesA = [];
        $scope.categoriesB = [all];
        $scope.categoriesC = [all];

        $scope.categories.forEach(function (cat) {
            if (!cat.parentId) {
                $scope.categoriesA.push(cat);
            }
        });

        $scope.categoriesA.forEach(function (a) {
            $scope.categories.forEach(function (c) {
                if (c.parentId == a.identifier) {
                    $scope.categoriesB.push(c);
                }
            });
        });

        $scope.categoriesB.forEach(function (b) {
            $scope.categories.forEach(function (c) {
                if (c.parentId == b.identifier) {
                    $scope.categoriesC.push(c);
                }
            });

        });
    }

    function findAllProductCallback(data) {
        var all = { identifier: "", name: "All" };
        $scope.products = [all];

        data.forEach(function (d) {
            $scope.products.push(d);
        });

        $scope.productsReady = true;

    }

    function findAllCategoryCallback(data) {

        // Collect category data
        data.forEach(function (d) {
            $scope.categories.push(d);
        });

        // Group category A, category B, category C
        groupCategory();

        $scope.categoriesReady = true;
    }

    function findAllBranchCallback(data) {
        var all = { identifier: "", name: "All "};
        $scope.branchs = [all];

        data.forEach(function (d) {
            $scope.branchs.push(d);
        });

        $scope.branchsReady = true;
    }

    // Query chart with given parameters
    // * labels = Chart's label
    // * touchs = Bar 1
    // * passes = Bar 2
    // * #chart is canvas element define in "views/homes/chart.html"
    function createChart(labels, touchs, passes) {

        var data = {
            labels: labels,
            datasets: [
                {
                    fillColor: "rgba(220,220,220,0.5)",
                    strokeColor: "rgba(220,220,220,1)",
                    data: passes
                },
                {
                    fillColor: "rgba(151,187,205,0.5)",
                    strokeColor: "rgba(151,187,205,1)",
                    data: touchs
                }
            ]
        };

        var ctx = $("#chart").get(0).getContext("2d");
        var chart = new Chart(ctx).Bar(data);
    }

    // Query default query...
    // 1. Create default query object
    // 2. Start query and render result
    // 3. Init all drop down...
    angular.element(document).ready(function () {

        var defaultQ = new collectionService.QueryInfo();
        homeService.queryCoarseCompare(defaultQ, queryCallback);

        setTimeout(initDropdown, 100);

        globalService.findAllCategory(findAllCategoryCallback);
        globalService.findAllProduct(findAllProductCallback);
        globalService.findAllBranch(findAllBranchCallback);


        var id = new DropdownId();

        var pi = setInterval(function () {
            if ($scope.productsReady) {
                $scope.$apply();
                $(id.product).dropdown().dropdown("set value", '"');
                clearInterval(pi);
            }
        }, 500);

        var ci = setInterval(function () {
            if ($scope.categoriesReady) {
                $scope.$apply();
                $(id.categoryB).dropdown().dropdown("set value", "");
                $(id.categoryC).dropdown().dropdown("set value", "");
                clearInterval(ci);
            }
        }, 500);

        var bi = setInterval(function () {
            if ($scope.branchsReady) {
                $scope.$apply();
                $(id.branch).dropdown().dropdown("set value", "");
                clearInterval(bi);
            }
        }, 500);
    });

    ////////////////////////////////////////////////////////////////////////////
    // ***** SCOPE *****
    ////////////////////////////////////////////////////////////////////////////
    // All scope variables
    // * months = list of months (drop down)
    // * years = list of years (drop down)
    // * times = list of times (drop down)
    // * currentQuery = query object (have many properties, see collections.js)
    // * queryType = can be "Daily", "Monthly" "Yearly" (see collections.js)
    // * screenWidth = current browser width

    $scope.months = collectionService.monthList;
    $scope.years = collectionService.yearList;
    $scope.times = collectionService.timeList;
    $scope.currentQuery = new collectionService.QueryInfo();
    $scope.queryType = collectionService.queryType;
    $scope.screenWidth = getScreenWidth();

    $scope.products = [];
    $scope.categories = [];
    $scope.branchs = [];

    $scope.productsReady = false;
    $scope.categoriesReady = false;
    $scope.branchsReady = false;

    $scope.categoriesA = [];
    $scope.categoriesB = [];
    $scope.categoriesC = [];

    $scope.selectedCatB = "";
    $scope.selectedCatC = "";

    // Change query type (trigger by top button [XXX, XXX, XXX])
    $scope.selectQueryType = function (type) {
        $scope.currentQuery.queryType = type;
    };

    // Check is given type equal to current query type..
    $scope.isSelected = function (type) {
        return type === $scope.currentQuery.queryType;
    }

    $scope.selectCategoryB = function (cat) {
        $scope.selectedCatB = cat.identifier;
    };

    $scope.selectCategoryC = function (cat) {
        $scope.selectedCatC = cat.identifier;
    }

    // Start query process...
    // 1. Get ID object (dedicate for drop down element)
    // 2. Get value from drop down element
    // 3. Parse value into integer (q.parse())
    // 4. Try to redraw chart width...
    // 5. Start query via homeSevice (see home_service.js)..
    // 6. Return value will process within queryCallback function ( above ^ )

    $scope.startQuery = function () {

        // Borrow currentQuery instance...
        var q = $scope.currentQuery;

        var d = new DropdownId();

        q.dailyMonth = getDropdownValue(d.dailyMonth);
        q.dailyYear = getDropdownValue(d.dailyYear);

        q.monthlyFrom = getDropdownValue(d.monthlyFrom);
        q.monthlyTo = getDropdownValue(d.monthlyTo);

        q.yearlyFrom = getDropdownValue(d.yearlyFrom);
        q.yearlyTo = getDropdownValue(d.yearlyTo);

        q.timeFrom = getDropdownValue(d.timeFrom);
        q.timeTo = getDropdownValue(d.timeTo);

        q.categoryB = getDropdownValue(d.categoryB);
        q.categoryC = getDropdownValue(d.categoryC);
        q.product = getDropdownValue(d.product);
        q.branch = getDropdownValue(d.branch);

        $log.info("<<Before Parse>>");
        $log.info(q);

        q.parse();

        $log.info("<<After Parse>>");
        $log.info(q);

        $scope.screenWidth = getScreenWidth();
        homeService.queryCoarseCompare(q, queryCallback);
    };

    // Reset all drop down (trigger by clear button)
    $scope.clear = function () {
        initDropdown();
    };
});