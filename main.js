let url = 'https://raw.githubusercontent.com/sathyajava2k/sathyajava2kdatasets/main/police-locals.csv';

//Load the data
let csv = null;
let current_scene = 1;
d3.csv(url)
	.then(data => {
		csv = data;
		if (current_scene > 1) {
			document.querySelector('button#back').disabled = false;
		}
		if (current_scene < 3) {
			document.querySelector('button#next').disabled = false;
		}
		create_scene1(data);
	}).catch(err => console.log(err));

//change_scene function
function change_scene(num) {
	if (current_scene + num > 0 && current_scene + num < 4) {
		document.querySelector('div#scene-' + current_scene).style.display = 'none';
		current_scene += num;
		document.querySelector('div#scene-' + current_scene).style.display = 'block';
		if (current_scene == 1) {
			document.querySelector('button#back').disabled = true;
			document.querySelector('button#next').disabled = false;
		} else if (current_scene == 2) {
			document.querySelector('button#back').disabled = false;
			document.querySelector('button#next').disabled = false;
			document.querySelector("div#bar").innerHTML = '';
			create_scene2(csv);
		} else if (current_scene == 3) {
			document.querySelector('button#back').disabled = false;
			document.querySelector('button#next').disabled = true;
			//document.querySelector("div#pie-chart").innerHTML = '';
			create_scene3(csv);
		}
	}
}

//Scene1
function create_scene1(data) {
	let scene1_width = 1150;
	let scene1_height = 2100;
	let margin = {
		top: 100,
		right: 30,
		bottom: 30,
		left: 150
	};

	let keys = ["total"];
	let colors = ["#115f9a"];

	let updated_data = [];

	data.forEach(d => {
		let b = {};
		b['city'] = d['city'];
		b['total'] = parseInt(d['police_force_size']);
		updated_data.push(b);
	});

	updated_data.sort((a, b) => b['total'] - a['total']);

	let svg = d3.select("#bar-chart")
		.append("svg")
		.attr("viewBox", [0, 0, scene1_width, scene1_height]);

	let x = d3.scaleLinear()
		.domain([0, d3.max(updated_data, d => d['total'])]).nice()
		.range([margin.left, scene1_width - margin.right]);

	let y = d3.scaleBand()
		.domain(updated_data.map(d => d['city']))
		.range([margin.top, scene1_height - margin.bottom])
		.padding(0.08);

	let z = d3.scaleOrdinal()
		.domain(keys)
		.range(colors);

	svg.append("g")
		.attr("class", "axis")
		.attr("transform", "translate(0," + margin.top + ")")
		.style("font-size", "12")
		.call(d3.axisTop(x).ticks(scene1_width / 100, "s"))
		.call(g => g.selectAll(".domain").remove());

	svg.append("g")
		.attr("class", "axis")
		.attr("transform", "translate(" + margin.left + ",0)")
		.style("font-size", "12")
		.call(d3.axisLeft(y).tickSizeOuter(0))
		.call(g => g.selectAll(".domain").remove());

	svg.append("g")
		.selectAll("g")
		.data(d3.stack().keys(keys)(updated_data))
		.enter()
		.append("g")
		.attr("fill", d => z(d.key))
		.selectAll("rect")
		.data(d => d)
		.enter()
		.append("rect")
		.attr("x", d => x(d[0]))
		.attr("y", d => y(d.data['city']))
		.attr("height", y.bandwidth());


	svg.selectAll('rect')
		.transition()
		.duration(1000)
		.delay((d, i) => i * 10)
		.attr("width", d => x(d[1]) - x(d[0]));

	const annotations = [{
		note: {
			label: "",
			title: "New york has the maximum police force with 32300 police officers",
			wrap: 150
		},
		connector: {
			end: "dot",
			type: "type"
		},
		x: 1040,
		y: 115,
		dy: 77,
		dx: 1
	}].map(function(d) {
		d.color = "#E8336D";
		return d
	});

	const makeAnnotations = d3.annotation()
		.type(d3.annotationLabel)
		.annotations(annotations);

	setTimeout(() => {
	  svg.append("g")
		.attr("class", "annotation-group")
		.attr('id', "police")
		.call(makeAnnotations);
	}, "1000")
}


//Scene2
function create_scene2(data) {
	let scene2_width = 500;
	let scene2_height = 400;
	let scene2_margin = {
		top: 50,
		right: 30,
		bottom: 30,
		left: 50
	};

	let updated_data = [];
	let select = d3.select('#cities3');
	data.forEach(d => {
		select.append('option').attr('value', d['city']).text(d['city']);
		let b = {};
		let total = parseInt(d['police_force_size']);
		let localsCount = Math.round(total * d['all']);
		let nonLocalsCount = total - localsCount;

		b['city'] = d['city'];
		b['type'] = 'Locals';
		b['count'] = localsCount / total;
		updated_data.push(b);

		b = {};
		b['city'] = d['city'];
		b['type'] = 'Non-Locals';
		b['count'] = nonLocalsCount / total;
		updated_data.push(b);
	});


	let svg = d3.select("#bar")
		.append("svg")
		.attr("viewBox", [0, 0, scene2_width, scene2_height]);

	let x = d3.scaleBand()
		.domain(updated_data.map(d => d['type']))
		.range([scene2_margin.left, scene2_width - scene2_margin.right])
		.padding(0.5);

	let y = d3.scaleLinear()
		.domain([0, d3.max(updated_data, d => d['count'])]).nice()
		.range([scene2_height - scene2_margin.bottom, scene2_margin.top])

	svg.append("g")
		.attr("class", "axis")
		.attr("transform", "translate(0," + (scene2_height - scene2_margin.bottom) + ")")
		.call(d3.axisBottom(x))
		.attr('font-size', 8);

	svg.append("g")
		.attr("class", "axis")
		.attr("transform", "translate(" + scene2_margin.left + ",0)")
		.call(d3.axisLeft(y).ticks(10, "%"))
		.attr('font-size', 8)
		.append("text")
		.attr("y", 6)
		.attr("dy", "0.71em")
		.attr("text-anchor", "end");

	let selected_data = updated_data.filter(d => {
		let sq = d3.select("#cities3").property("value");
		return d['city'] === sq;
	});

	let xs = {
		'Locals': 177,
		'Non-Locals': 350
	};
	let path = svg.append('path')
		.attr('d', 'M 177 40L 167 370')
		.style('fill', 'none')
		.style('stroke', '#E8336D')
		.style('stroke-width', 1)
		.style('visibility', 'hidden');

	let text = svg.append('text')
		.attr('x', 80)
		.attr('y', 35)
		.attr('font-size', 6)
		.style('fill', '#E8336D')
		.style('visibility', 'hidden');

	svg.selectAll("rect")
		.data(selected_data)
		.enter().append("rect")
		.attr("x", d => x(d['type']))
		.attr("width", x.bandwidth())
		.attr("fill", "#115f9a")
		.on("mouseover", d => {
			let xpos = xs[d['type']];
			let c = d['city'].split(',')[0];
			let note = '';

			if (d['type'] === 'Locals')
				note = 'In ' + c + ', ' + d3.format(".0%")(d['count']) + ' of Police Officers are living in the city';

			if (d['type'] === 'Non-Locals')
				note = 'In ' + c + ', ' + d3.format(".0%")(d['count']) + ' of Police Officers are NOT living in the city';

			if (d['count'] == 0) {
				note = 'Data Not Available';
			}
			path.attr('d', 'M ' + xs[d['type']] + ' 40L ' + xs[d['type']] + ' 370')
				.style('visibility', 'visible');
			text.text(note);
			let len = text.node().getComputedTextLength();
			if (xpos + len >= scene2_width) {
				text.attr('x', scene2_width - len - 20);
			} else {
				text.attr('x', xpos - 30);
			}
			text.style('visibility', 'visible');
		})
		.on("mouseout", d => {
			path.style('visibility', 'hidden');
			text.style('visibility', 'hidden');
		});;

	svg.selectAll("rect")
		.attr("y", scene2_height - scene2_margin.bottom)
		.attr("height", 0)
		.transition().duration(500)
		.delay((d, i) => i * 10)
		.attr("y", d => y(d['count']))
		.attr("height", d => scene2_height - scene2_margin.bottom - y(d['count']));

	d3.select("#cities3").on("change", () => {
		let sq = d3.select("#cities3").property("value");
		let data = updated_data.filter(d => d['city'] === sq)

		svg.selectAll("rect")
			.data(data)
			.transition().duration(500)
			.delay((d, i) => i * 10)
			.attr("x", d => x(d['type']))
			.attr("y", d => y(d['count']))
			.attr("height", d => scene2_height - scene2_margin.bottom - y(d['count']));
	});
}

//Scene3
function create_scene3(data) {
	document.getElementById("pie-chart-legends").innerHTML = "";
	let svgLegend = d3.select("#pie-chart-legends")
		.append("svg").attr("viewBox", [0, 0, 400, 50]);

	let colors = ["#808000", "#58595B", "#006c93", "#8D2048", "#00746F"];
	let legend = svgLegend.selectAll(".legend")
		.data(colors)
		.enter().append("g")
		.attr("class", "legend")
		.attr("transform", (d, i) => "translate(50," + (i * 10) + ")");

	legend.append("rect")
		.attr("x", 150)
		.attr("width", 7)
		.attr("height", 7)
		.style("fill", (d, i) => colors.slice()[i]);

	legend.append("text")
		.attr("x", 160)
		.attr("y", 6)
		.attr("dx", ".5em")
		.attr("font-size", "0.5em")
		.style("text-anchor", "start")
		.text((d, i) => {
			switch (i) {
				case 0:
					return "White";
				case 1:
					return "Non-White";
				case 2:
					return "Black";
				case 3:
					return "Hispanic";
				case 4:
					return "Asian";
			}
		});


	var svg = d3.select("#pie-chart");
	g = svg.append("g").attr("transform", "translate(450,250)");

	let updated_data = [];
	let select = d3.select('#cities2');

	data.forEach(d => {
		select.append('option').attr('value', d['city']).text(d['city']);

		let b = {};
		b['city'] = d['city'];
		b['race'] = 'White';
		b['count'] = (d['white'] !== '**') ? parseFloat(d['white']) : 0;
		updated_data.push(b);
		b = {};
		b['city'] = d['city'];
		b['race'] = 'Non-White';
		b['count'] = (d['non-white'] !== '**') ? parseFloat(d['non-white']) : 0;
		updated_data.push(b);
		b = {};
		b['city'] = d['city'];
		b['race'] = 'Black';
		b['count'] = (d['black'] !== '**') ? parseFloat(d['black']) : 0;
		updated_data.push(b);
		b = {};
		b['city'] = d['city'];
		b['race'] = 'Hispanic';
		b['count'] = (d['hispanic'] !== '**') ? parseFloat(d['hispanic']) : 0;
		updated_data.push(b);
		b = {};
		b['city'] = d['city'];
		b['race'] = 'Asian';
		b['count'] = (d['asian'] !== '**') ? parseFloat(d['asian']) : 0;
		updated_data.push(b);
	});


	let selected_data = updated_data.filter(d => {
		let sq = d3.select("#cities2").property("value");
		return d['city'] === sq;
	});

	update(g, selected_data);

	d3.select("#cities2").on("change", () => {
		let sq = d3.select("#cities2").property("value");
		let data = updated_data.filter(d => d['city'] === sq);
		update(g, data);
	});
}

//Scene3 functions
var pieGenerator = d3.pie()
	.sort(function(a, b) {
		return a.count > b.count;
	})
	.value(function(d) {
		return d.count;
	});

var arcGenerator = d3.arc()
	.innerRadius(75)
	.outerRadius(200)
	.padAngle(.02)
	.padRadius(100)
	.cornerRadius(4);

function update(g, myData) {
	var arcData = pieGenerator(myData);
	var colorDomain = myData.map(function(a) {
		return a.race;
	});
	var colorScale = d3.scaleOrdinal()
		.domain(colorDomain)
		.range(['#808000', '#58595B', '#006c93', '#8D2048', '#00746F'])

	// Create a path element and set its d attribute
	var u = g.selectAll('path');

	u.data(arcData)
		.enter()
		.append('path')
		.merge(u)
		.attr('d', arcGenerator)
		.each(function(d) {
			d3.select(this)
				.style('fill', function(d) {
					return colorScale(d.data.race);
				})
		});

	u.data(arcData)
		.enter()
		.append('text')
		.text(function(d) {
			return (d.data.count * 100).toFixed(2) + "%"
		})
		.attr("transform", function(d) {
			return "translate(" + arcGenerator.centroid(d) + ")";
		})
		.style("text-anchor", "middle")
		.style("font-size", 17);
		

	u.exit().remove();
}