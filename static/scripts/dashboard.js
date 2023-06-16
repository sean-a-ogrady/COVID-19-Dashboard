d3.csv("static/data/covid_19_data.csv", function(data) {
    window.onresize = function(){ location.reload(); }
    parallelCoords(data);
    corrMatrix(data);
    areaChart({
        column_x: "CASE_COUNT",
        column_y : "HOSPITALIZED_COUNT"
    });
    scatterMatrix(data);
});