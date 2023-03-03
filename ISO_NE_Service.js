var btnGetData = document.getElementById("btnGetData");
var inputDate = document.getElementById("inputDate");
var dataType = document.getElementById("dataType");
var result = document.getElementById("results");
var loading_status = document.getElementById("loading_status");

var today = new Date().toISOString().split("T")[0]; //get today's date in yyyy-mm-dd format
inputDate.max = today; //max allowed input date is today
inputDate.value = today; //set default date to today

btnGetData.onclick = cbBtnGetData;

//callback function to display selected data
function cbBtnGetData() {
  console.log("data requested successfully");
  loading_status.innerHTML = "Loading Data...";

  var base = "https://webservices.iso-ne.com/api/v1.1"; //base API url

  //input parameters
  var date = inputDate.value.split("-").join(""); //remove hiphens from date string (yyyymmdd)
  var location = document.getElementById("location"); //get location id from html value

  //alert if no location selected
  if (location.value == "none") {
    alert("No Location Selected");
    loading_status.innerHTML = "...Waiting For Input";
    return;
  }

  //url extensions to specify API call
  var lmp = "/hourlylmp/rt/final/day/" + date + "/location/" + location.value;
  var demand =
    "/combinedhourlydemand/day/" + date + "/location/" + location.value;

  //concatenate full url based on user inputs then fetch and display data
  switch (dataType.value) {
    case "HourlyLmp":
      var url = base + lmp;
      generate_hourlyLmp(url); //fetch and display data
      break;
    case "HourlyDemand":
      var url = base + demand;
      generate_hourlyDemand(url);
      break;
    default:
      //alert if no data type selected
      alert("No Data Type Selected");
      loading_status.innerHTML = "...Waiting For Input";
      return;
  }
}

//function to display hourly LMP data in a table
function generate_hourlyLmp(url) {
  console.log("generating hourly LMP data");

  getResponse(url).then((data) => {
    var lmp = []; //location marginal pricing
    var timeString = [];
    var timeObject = [];
    var d = [];
    var t = [];
    var stats = [];

    for (i in data.HourlyLmps.HourlyLmp) {
      lmp[i] = data.HourlyLmps.HourlyLmp[i].LmpTotal;
      timeString[i] = data.HourlyLmps.HourlyLmp[i].BeginDate; //time as a string
      timeObject[i] = new Date(timeString[i]); //convert time to a datetime object

      var timeStamp = timeString[i].split("T"); //split date and time
      d[i] = timeStamp[0]; //date
      t[i] = timeStamp[1].split("-")[0]; //time
      stats[i] = [d[i], t[i], lmp[i]]; //array of data to display
    }

    //array to hold the html for the table
    var html = [];

    //add the opening table, caption and tablebody tags
    html.push("<table>");
    html.push("<caption>Hourly LMP Data:</caption>");
    html.push("<tbody>");

    //add table headers
    html.push("<tr>");
    html.push("<th>" + "Date" + "</td>");
    html.push("<th>" + "Time" + "</td>");
    html.push("<th>" + "LMP" + "</td>");
    html.push("</tr>");

    display_Result(html, stats);

    console.log(stats);
  });
}

//function to display combined hourly demand data in a table
function generate_hourlyDemand(url) {
  console.log("generating hourly demand data");

  getResponse(url).then((data) => {
    var da_load = []; //day ahead load
    var rt_load = []; //real time load
    var timeString = [];
    var timeObject = [];
    var d = [];
    var t = [];
    var stats = [];

    for (i in data.CombinedHourlyDemands.CombinedHourlyDemand) {
      da_load[i] = data.CombinedHourlyDemands.CombinedHourlyDemand[i].DaLoad;
      rt_load[i] = data.CombinedHourlyDemands.CombinedHourlyDemand[i].RtLoad;
      timeString[i] =
        data.CombinedHourlyDemands.CombinedHourlyDemand[i].BeginDate; //time as a string
      timeObject[i] = new Date(timeString[i]); //convert time to a datetime object

      var timeStamp = timeString[i].split("T"); //split date and time
      d[i] = timeStamp[0]; //date
      t[i] = timeStamp[1].split("-")[0]; //time
      stats[i] = [d[i], t[i], rt_load[i], da_load[i]]; //array of data to display
    }

    //array to hold the html for the table
    var html = [];

    //add the opening table, caption and tablebody tags
    html.push("<table>");
    html.push("<caption>Combined Hourly Demand:</caption>");
    html.push("<tbody>");

    //add table headers
    html.push("<tr>");
    html.push("<th>" + "Date" + "</td>");
    html.push("<th>" + "Time" + "</td>");
    html.push("<th>" + "RT Load" + "</td>");
    html.push("<th>" + "DA Load" + "</td>");
    html.push("</tr>");

    display_Result(html, stats);

    console.log(stats);
  });
}

//function to make api call (url input, parsed json output)
function getResponse(url) {
  console.log("API fetch in progress");
  var cors_api_url = "https://cors-anywhere.herokuapp.com/"; //CORS proxy to bypass No Cross-Origin Resource Sharing error

  //API credentials
  var username = "vakativ@wit.edu";
  var pass = "Soccerman";

  //wait for API response then return parsed json
  return (
    fetch(cors_api_url + url, {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: "Basic " + btoa(username + ":" + pass),
      },
    })
      .then((response) => response.json()) //parse json data
      //catch errors
      .catch((error) => {
        //console.log("error:", error),
        alert("Error Fetching API Data"),
          (loading_status.innerHTML = "...Waiting For Input");
      })
  );
}

//function to display data in an html table
function display_Result(html, data) {
  //check if data is empty
  if (data.length == 0) {
    loading_status.innerHTML = "No Data Available";
    return;
  } else {
    console.log("displaying data");
    loading_status.innerHTML = "";

    //loop through the array of objects
    data.forEach(function (item) {
      //add the opening table row tag
      html.push("<tr>");

      //loop though each of the objects properties
      for (var key in item) {
        //append the table data containing the objects property value
        html.push("<td>" + item[key] + "</td>");
      }

      //add the closing table row tag
      html.push("</tr>");
    });

    //add the closing table and table body tags
    html.push("</table>\n</tbody>");

    //display result
    loading_status.innerHTML = html.join("");
  }
}
