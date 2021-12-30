function makeGraph(data) {

    const width = 1000,
        height = 1000;

    let i = 0;

    const root = d3.hierarchy(data);
    const transform = d3.zoomIdentity;
    let node, link;

    const svg = d3.select('body').append('svg')
      .call(d3.zoom().scaleExtent([1/2, 8]).on('zoom', zoomed))
      .append('g')
      .attr('transform', 'translate(40,0)');

    const simulation = d3.forceSimulation()
      .force('link', d3.forceLink().id(function(d) { return d.id; }))
      .force('charge', d3.forceManyBody().strength(-50).distanceMax(300))
      .force('center', d3.forceCenter( width/2, height/4 ))
      .on('tick', ticked)

    function update() {
      const nodes = flatten(root)
      const links = root.links()

      link = svg
        .selectAll('.link')
        .data(links, function(d){ return d.target.id })

      link.exit().remove()

      const linkEnter = link
        .enter()
        .append('line')
        .attr('class', 'link')
        .style('stroke', '#000' )
        .style('opacity', '0.2')
        .style('stroke-width', 2)

      link = linkEnter.merge(link)

      node = svg
        .selectAll('.node')
        .data(nodes, function(d){ return d.id })

      node.exit().remove()

    const nodeEnter = node
        .enter()
        .append('g')
        .attr('class', 'node')
        .attr('stroke', '#666')
        .attr('stroke-width', 2)
        .style('fill', color)
        .style('opacity', 1)
        .on('click', clicked)
        .call(d3.drag()
          .on('start', dragstarted)
          .on('drag', dragged)
          .on('end', dragended))
        .on("mouseover", function(d)
        {
           d3.select(this).select("text").style("visibility", "visible").style("font-size", 20)
        })
        .on("mouseout", function(d)
        {
           d3.select(this).select("text").style("visibility", "hidden")
        })


    nodeEnter.append('circle')
        .attr("r", function(d) { return Math.sqrt(d.data.size) / 10 || 4.5; })
        .style('text-anchor', function(d){ return d.children ? 'end' : 'start'; })
        .text(function(d){ return d.data.name })


        node = nodeEnter.merge(node)
        simulation.nodes(nodes)
        simulation.force('link').links(links)

    var labels = nodeEnter.append("text")
      .text(function(d) { return d.data.name; })
      .style("visibility", "hidden");

    }

    function sizeContain(num) {
     num = num > 1000 ? num/1000 : num/100
     if (num < 4) num = 4
     return num
    }

    function color(d) {
      return d._children ? "#51A1DC" // collapsed package
          : d.children ? "#51A1DC" // expanded package
          : "#F94B4C"; // leaf node
    }

    function radius(d) {
      return d._children ? 8
        : d.children ? 8
        : 4
    }

    function ticked() {
      link
        .attr('x1', function(d){ return d.source.x; })
        .attr('y1', function(d){ return d.source.y; })
        .attr('x2', function(d){ return d.target.x; })
        .attr('y2', function(d){ return d.target.y; })

      node
        .attr('transform', function(d){ return `translate(${d.x}, ${d.y})`})
    }

    function clicked(d) {
      if (!d3.event.defaultPrevented) {
        if (d.children) {
          d._children = d.children;
          d.children = null;
        } else {
          d.children = d._children;
          d._children = null;
        }
        update()
      }
    }

    function dragstarted(d) {
      if (!d3.event.active) simulation.alphaTarget(0.3).restart()
      d.fx = d.x
      d.fy = d.y
    }

    function dragged(d) {
      d.fx = d3.event.x
      d.fy = d3.event.y
    }

    function dragended(d) {
      if (!d3.event.active) simulation.alphaTarget(0)
      d.fx = null
      d.fy = null
    }

    function flatten(root) {
      const nodes = []
      function recurse(node) {
        if (node.children) node.children.forEach(recurse)
        if (!node.id) node.id = ++i;
        else ++i;
        nodes.push(node)
      }
      recurse(root)
      return nodes
    }

    function zoomed() {

      svg.attr('transform', d3.event.transform)
    }

    update();
}

function get() {
    d3.select('svg').remove();
    var api_url = document.getElementById("api_url").value;
    if(api_url.length > 0) {

        d3.json(api_url, {
          headers: new Headers({
            "Authorization": document.getElementById("auth_header").value
          }),
        }).then(api_data => {
            var graph_data = makeData(api_data);
            makeGraph(graph_data);
        });
    }
}

function makeData(x) {
    var data = x;
    let obj = {
        count: 0
    }
    res = dataHelper(data, "root", obj);

    if(obj.count > 500) {
        alert("Response too big");
        return {};
    }
    console.log(res);
    console.log("y");
    return res;
}

function dataHelper(data, name, obj) {
    var res = {};
    res["name"] = name;
    res["children"] = [];
    for (var key in data) {
        let value = data[key];
        obj.count++;
        if(typeof value == 'object') {
            res["children"].push(dataHelper(value, key, obj));
        } else {
            res["children"].push({"name" : key});
        }
    }
    return res;
}

function search() {
    var ipname = document.getElementById("searchip").value;
    var theNode = d3.selectAll(".node").filter(function(d) { return d.data.name === ipname });
    console.log(theNode);
    theNode.select("text").transition()
            .duration(750)
            .attr("x", 22)
            .style("fill", "black")
            .style("stroke", "red")
            .style("stroke-width", "1px")
            .style("font", "30px sans-serif")
            .style("visibility", "visible")
        theNode.select("circle").transition()
            .duration(750)
            .attr("r", 10)
}







