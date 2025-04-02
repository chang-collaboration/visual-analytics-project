document.addEventListener('DOMContentLoaded', function() {
    const width = 900, height = 600;
    let nodes = [
        {id: 1, group: 1},
        {id: 2, group: 1},
        {id: 3, group: 2},
        {id: 4, group: 2},
        {id: 5, group: 3},
        {id: 6, group: 3},
    ];

    let links = [
        {source: 1, target: 2},
        {source: 3, target: 4},
        {source: 5, target: 6},
    ];

    let svg = d3.select("#graph").append("svg")
        .attr("width", width)
        .attr("height", height);

    let simulation = d3.forceSimulation(nodes)
        .force("link", d3.forceLink(links).id(d => d.id))
        .force("charge", d3.forceManyBody())
        .force("center", d3.forceCenter(width / 2, height / 2));

    let link = svg.append("g")
        .attr("class", "links")
        .selectAll("line")
        .data(links)
        .enter().append("line");

    let node = svg.append("g")
        .attr("class", "nodes")
        .selectAll("circle")
        .data(nodes)
        .enter().append("circle")
        .attr("r", 5)
        .call(d3.drag()
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended));

    simulation.on("tick", () => {
        link.attr("x1", d => d.source.x)
            .attr("y1", d => d.source.y)
            .attr("x2", d => d.target.x)
            .attr("y2", d => d.target.y);

        node.attr("cx", d => d.x)
            .attr("cy", d => d.y);
    });

    function dragstarted(event, d) {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
    }

    function dragged(event, d) {
        d.fx = event.x;
        d.fy = event.y;
    }

    function dragended(event, d) {
        if (!event.active) simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
    }

    // Implementing filter, group, separate, and adjust clusters
    document.getElementById('filterBtn').addEventListener('click', filterNodes);
    document.getElementById('groupBtn').addEventListener('click', () => updateGroups(true));
    document.getElementById('separateBtn').addEventListener('click', () => updateGroups(false));
    document.getElementById('adjustClustersBtn').addEventListener('click', adjustClusters);

    function filterNodes() {
        // Example filtering: keep nodes with even IDs
        nodes = nodes.filter(n => n.id % 2 === 0);
        restartSimulation();
    }

    function updateGroups(groupTogether) {
        // Example grouping/separating: Adjust the 'group' attribute based on the action
        if (groupTogether) {
            nodes.forEach(n => n.group = 1); // Group all nodes together
        } else {
            nodes.forEach(n => n.group = Math.ceil(n.id / 2)); // Separate into smaller groups
        }
        restartSimulation();
    }

    function adjustClusters() {
        // Adjust clusters could dynamically modify the 'group' attribute or node positions
        // Here, just reshuffle groups as an example
        nodes.forEach(n => n.group = (n.group % 3) + 1);
        restartSimulation();
    }

    function restartSimulation() {
        // Restart the simulation with the updated nodes and links
        simulation.nodes(nodes);
        simulation.force("link").links(links);
        simulation.alpha(1).restart();

        // Re-bind data for nodes and links
        link = link.data(links, d => `${d.source.id}-${d.target.id}`);
        link.exit().remove();
        link = link.enter().append("line").merge(link);

        node = node.data(nodes, d => d.id);
        node.exit().remove();
        node = node.enter().append("circle").attr("r", 5).merge(node)
            .call(d3.drag()
                .on("start", dragstarted)
                .on("drag", dragged)
                .on("end", dragended));
    }
});
