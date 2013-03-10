$(function() {
    $("#survey_form").submit(function(e){
        //e.preventDefault();
        var yelp_use = $("[name='yelp_use']:checked").val();
        var yelp_trust = $("[name='yelp_trust']:checked").val();
        var facebook_use = $("[name='facebook_use']:checked").val();
        var facebook_trust = $("[name='facebook_trust']:checked").val();
        var recommendation_sources = $("[name='recommendation_sources']:checked");
        var recommendation_other = $("#recommendation_other").val();

        if(yelp_use == undefined) {
            alert("Please answer question 1.");
            return false;
        }
        if(yelp_trust == undefined) {
            alert("Please answer question 2.");
            return false;
        }
        if(facebook_use == undefined) {
            alert("Please answer question 3.");
            return false;
        }
        if(facebook_trust == undefined) {
            alert("Please answer question 4.");
            return false;
        }
        if(recommendation_sources.length == 0 && recommendation_other == "") {
            alert("Please answer question 5.");
            return false;
        } 
        return true;
    });
});
