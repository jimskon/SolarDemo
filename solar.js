// JavaScript for Solar Data Demo
// Jim Skon, Kenyon College, 2023
// Using https://github.com/chartjs/Chart.js
const Url="http://belize.expertlearningsystem.org/Knowledge/?SessionID=1234567890:9999";
const Sites="&Query=SolarNames()";
const Watts="&Query=SolarWatts(";
const AllWatts="&Query=SolarWatts(*)";
const siteDayWatts="&Query=SolarHistory(SITE,qWattsmin1,DATE*)";
// &Query=SolarHistory(8B0AB1,qWattsmin1,2023-02-02*)
// &Query=SolarHistory(SITE,qWattsmin1,DATE*)
console.log("Start!");
const ErrMess = '<p style="color:red">Error reading from server.</p>';
var siteMap = {};  // A global place to store MAC to School name map



// Add an event listener for each item in the pull down menu
function updateSiteList() {
document.querySelectorAll('.dropdown-menu a').forEach(item => {
    item.addEventListener('click', event => {
		var element = event.target;
		var site=element.textContent;
		siteMAC = element.getAttribute("value");
		console.log("pick: "+site+" "+siteMAC);
		// Get the pulldown parent
		var pullDown = element.parentElement.parentElement;
		// Get and set the selection displayed
		var selection = pullDown.querySelectorAll(".selection")[0];
		selection.innerHTML = site;
		displaySite(site,siteMAC);
    })
})
}
// Start things off by getting site information
getSites();

function todaysDate() {
	var today = new Date();
	var dd = String(today.getDate()).padStart(2, '0');
	var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
	var yyyy = today.getFullYear();
	var date = yyyy +'-'+ mm +'-'+ dd;
	return date;
	
}
function processSites(results) {
	if (!results["success"]) {
		document.querySelector('#output').innerHTML = ErrMess+"1";
		return;
	}
	//var table = siteTable(results['message']);
    //document.querySelector('#output').innerHTML = table;
    data=results['message'];
    siteDropdown(data);
    updateSiteList();
    siteMap = data;
    
    getSitesWatts();


}

function getSites() {
	// Clear the previous results
    document.querySelector('#output').innerHTML = "";
    fetch(Url+Sites, {
	method: 'get'
    })
	.then (response => response.json() )
        .then (data => processSites(data))
	.catch(error => {
	    document.querySelector('#output').innerHTML = ErrMess+"2";
	})

}

// Build output table 
function siteTable(data) {
    var table = '<table class="w3-table-all w3-hoverable" border="2"><tr><th>School</th><th>MAC</th><tr>';
	console.log(JSON.stringify(data));
	for(var key in data) {
		// Set up 
		sitMap
		table += "<tr><td>"+key+"</a>";
		table+="</td><td>"+data[key]+"</td></tr>";
    }
    table += "</table>";

    return table;
}

// Build site dropdown 
function siteDropdown(data) {
    var dropdown = '<a class="dropdown-item" href="#" value="0">All</a>';
    for(var key in data) {
		dropdown += '<a class="dropdown-item" href="#" value="'+key+'">'+data[key]+'</a>';
    };
    
    document.querySelector('#searchtype').innerHTML = dropdown;

    return;
}

// Process the watt data and build graph
function processSitesWatts(results) {
	if (!results["success"]) {
		document.querySelector('#output').innerHTML = ErrMess+"6";
		return;
	}

	today = todaysDate();

	dataList = results['message'];
	wattsData = [];
	wattsLabel = [];
	dataList.forEach(function(site) {
		siteDate = site[2].split(" ")[0];
		console.log(siteDate,today);
		if (parseInt(site[1])>0 && siteDate == today) {
			wattsData.push(site[1]);
			wattsLabel.push(siteMap[site[0]]);
		}
	});
	// Display graph
	makeSummaryGraph(wattsLabel,wattsData);

}

// Get watt data, then display graph
function getSitesWatts() {

    fetch(Url+AllWatts, {
	method: 'get'
    })
	.then (response => response.json() )
        .then (data => processSitesWatts(data))
	.catch(error => {
	    document.querySelector('#output').innerHTML = ErrMess+"4";
	})

}

// Process the Site MAC to Name list, then get watt data to make graph
function processSite(results) {
	if (!results["success"]) {
		document.querySelector('#output').innerHTML = ErrMess+"3";
		return;
	}
	var data = results['message'];
	console.log(data);



}

// Get the Site MAC to Name list
function displaySite(site,siteMAC) {
	var shortMAC = siteMAC.substr[siteMAC.length - 6];
	var command=Url+siteDayWatts;
	command.replace("SITE",shortMAC);
	command.replace("DATE",todaysDate());
	console.log(command);
	fetch(command+")", {
		method: 'get'
    	})
		.then (response => response.json() )
        	.then (data => processSite(data))
		.catch(error => {
	    	document.querySelector('#output').innerHTML = ErrMess+"7";
		})
}

function makeSummaryGraph(names,watts) {
  const ctx = document.getElementById('chart');


  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: names,
      datasets: [{
        label: 'Watts',
        data: watts,
        borderWidth: 1
      }]
    },
    options: {
      //indexAxis: 'y',
      scales: {
        y: {
          beginAtZero: true
        }
      }
    }
  });
}
