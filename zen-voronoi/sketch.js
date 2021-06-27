let pointSize = 10
let numPoints = 20
let swirlDensity = 15

// TODO

// Bug fixes:
// - Sometimes there's a hole. I believe this occurs when there is a very short edge. This shouldn't be an issue (was not an issue in the old version -- investigate.)

// New features:
// - Mask lines over gradient for cool color effects
// - Move the polygons to simulate swirling. 
// - Move points to create cool effects (???)

function setup() {
  frameRate(60);
  createCanvas(window.innerWidth, window.innerHeight);
  background('#ffffff');

  points = generateRandomPoints(numPoints);

  var voronoiObj = new Voronoi();
  var bbox = {xl: 10, xr: window.innerWidth, yt: 10, yb: window.innerHeight};
  var diagram = voronoiObj.compute(points, bbox);
  console.log(diagram);
  // drawPoints(points);
  drawDiagram(diagram);
  drawSwirlyBits(diagram);
}

function drawDiagram(diagram) {
  diagram.edges.map(edge => line(edge.va.x, edge.va.y, edge.vb.x, edge.vb.y));
}


function drawPoints(points) {
  points.map(point => ellipse(point.x, point.y, pointSize, pointSize))
}

function generateRandomPoints(numPoints) {
  var points = []
  for (let idx = 0; idx < numPoints; idx++) {
    points.push({
      x: random(0, width),
      y: random(0, height)
    });
  }
  return points
}
/**
 * Given a Voronoi diagram, draw the 'swirly bits' (the technical name) in each cell.
 * @param {Voronoi} diagram
 */
function drawSwirlyBits(diagram) {
  diagram.cells.forEach(function(cell) {
    edges = cell.halfedges.map(halfedge => {
      return {x1: halfedge.edge.va.x, y1: halfedge.edge.va.y, x2: halfedge.edge.vb.x, y2: halfedge.edge.vb.y}
    });
    edges.reverse();
    edges = rearrangeEdges(edges);
    // colorEdges(edges);
    // stroke('red');
    // strokeWeight(4);
    drawSwirlyBitsPolygon(edges, 0, 0);
  });
}

function swapEdgeDirection(edge) {
  temp_x1 = edge.x1;
  temp_y1 = edge.y1;
  edge.x1 = edge.x2;
  edge.y1 = edge.y2;
  edge.x2 = temp_x1;
  edge.y2 = temp_y1;
  return edge;
}


/**
 * Regarrange edges in a cell such that they are all facing the same way (clockwise)
 * @param {}} edges 
 * @returns 
 */
function rearrangeEdges(edges) {
  edges = [...new Set(edges)]; // TODO do we need these this?
  for (let idx = 0; idx < edges.length; idx ++) {
    var nextIdx = (idx + 1) % edges.length;
    edge = edges[idx]
    nextEdge = edges[nextIdx]

    if (edge.x2 == nextEdge.x1 && edge.y2 == nextEdge.y1) {
      // Order is correct
      continue
    } else if (edge.x1 == nextEdge.x2 && edge.y1 == nextEdge.y2) {
      // Both elements are swapped
      edge = swapEdgeDirection(edge);
      nextEdge = swapEdgeDirection(nextEdge);
    } else if (edge.x1 == nextEdge.x1 && edge.y1 == nextEdge.y1) {
      // First element is swapped
      edge = swapEdgeDirection(edge);
    } else if (edge.x2 == nextEdge.x2 && edge.y2 == nextEdge.y2) {
      // Second element is swapped
      nextEdge = swapEdgeDirection(nextEdge);
    }

    edges[idx] = edge;
    edges[nextIdx] = nextEdge;
  }

  // Assert edges are correct
  // for (let idx = 0; idx < edges.length; idx ++) {
  //   edge = edges[idx]
  //   nextEdge = edges[(idx + 1) % edges.length]

  //   if (edge.x2 == nextEdge.x1 && edge.y2 == nextEdge.y1) {
  //     // Order is correct
  //     continue
  //   } else {
  //     console.log("FAILURE VALIDATING REARRANGED EDGES");
  //   }
  // }
  return edges;
}

function getNextEdgePoint(edge) {
  var dx = edge.x2 - edge.x1;
  var dy = edge.y2 - edge.y1;
  var numPoints = Math.ceil(Math.sqrt(dx * dx + dy * dy)/swirlDensity)
  var stepx = dx / numPoints;
  var stepy = dy / numPoints;
  var px = edge.x1 + stepx;
  var py = edge.y1 + stepy;
  return {x: px, y: py};
}

function drawSwirlyBitsPolygon(edges, prevX, prevY) {
  innerEdges = []
  for (let idx = 0; idx < edges.length; idx++) {
    edge = edges[idx]
    nextEdge = edges[(idx + 1) % edges.length]

    var xDistance = nextEdge.x1 - edge.x1;
    var yDistance = nextEdge.y1 - edge.y1;
    var distance = Math.sqrt(xDistance * xDistance + yDistance * yDistance);

    if (swirlDensity > distance) {
      console.log('here: ' + distance + " | (" + edge.x1 + "," + edge.y1+ ") -> ("+ nextEdge.x1 + ","+ nextEdge.y1 + ") | " + idx + " -> " + (idx + 1) % edges.length);
      console.log(edges)
      return;
    }

    edgePoint = getNextEdgePoint(edge);
    nextEdgePoint = getNextEdgePoint(nextEdge);

    line(edgePoint.x, edgePoint.y, nextEdgePoint.x, nextEdgePoint.y)
    innerEdges.push({x1: edgePoint.x, y1: edgePoint.y, x2: nextEdgePoint.x, y2: nextEdgePoint.y})
  }

  drawSwirlyBitsPolygon(innerEdges);
}