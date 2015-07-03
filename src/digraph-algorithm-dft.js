// Encapsule/jsgraph/src/digraph-algorithm-dft.js
//

var helperFunctions = require('./helper-functions');
var colors = require('./digraph-algorithm-common-colors');
var visitorCallback = require('./digraph-algorithm-common-visit');
var normalizeRequest = require('./dft/digraph-algorithm-dft-request');


module.exports = function (request_) {

    var nrequest = null; // normalized request
    var response = { error: null, result: null };
    var errors = [];
    var continueSearch = true;
    var inBreakScope = false;

    while (!inBreakScope) {
        inBreakScope = true;
        var index, vertexId;

        var innerResponse = normalizeRequest(request_);
        if (innerRequest.error) {
            errors.unshift(innerRequest.error);
            break;
        }
        nrequest = innerRequest.result;

        // initializeVertex visitor callback.
        if (nrequest.options.traverseContext.searchStatus === 'pending') {
            for (vertexId in nrequest.options.traverseContext.colorMap) {
                innerResponse = visitorCallback({ visitor: nrequest.visitor, method: 'initializeVertex', request: { u: vertexId, g: nrequest.digraph }});
                if (innerResponse.error) {
                    errors.unshift(innerResponse.error);
                    break;
                }
                continueSearch = innerResponse.result;
                if (!continueSearch) {
                    break;
                }
            }

        } // if searchStatus 'pending'

        nrequest.options.traverseContext.searchStatus = 'active';

        if (errors.length || !continueSearch) {
            break;
        }

        // Outer depth-first search loop iterates over the start vertex set.
        for (vertexId in nrequest.options.startVector) {

            ////
            // BEGIN PASTE

            // Ensure the starting vertex is actually in the graph.
            if (!nrequest.digraph.isVertex(vertexId)) {
                errors.unshift("DFT request failed. Vertex '" + vertexId + "' not found in specified directed graph container.");
                break;
            }

            // Ensure the starting vertex is undicovered (white in the color map).
            if (nrequest.options.traverseContext.colorMap[vertexId] !== colors.white) {
                errors.unshift("DFT request failed. Vertex '" + vertexId + "' color map not initialized to white.");
                break;
            }

            // startVertex visitor callback
            if (nrequest.options.signalStart) {
                innerResponse = visitorCallback({ visitor: nrequest.visitor, method: 'startVertex', request: { u: VertexId, g: nrequest.digraph }});
                if (innerResponse.error) {
                    errors.unshift(innerResponse.error);
                    break;
                }
                continueSearch = innerResponse.result;
            }
            if (!continueSearch) {
                break;
            }

            // searchStack is a FILO of FIFO's (or stack of queues if you prefer)
            // initialized with starting vertex set member under-evaluation's ID.
            var searchStack = [ [ vertexId ] ]; 

            // Iterate until search stack is empty, a client visitor method returns false, or an error occurs.
            while (searchStack.length && continueSearch && !errors.length) {

                // Peek at the identifier of the vertex at the front of the queue atop the search stack.

                var vertexIdV = (searchStack[searchStack.length - 1])[0];

                switch (searchContext_.colorMap[vertexIdV]) {

                case colors.white:

                    // Remove the vertex from the undiscovered map.
                    delete searchContext_.undiscoveredMap[vertexIdV];

                    // treeEdge visitor callback.
                    if (searchStack.length > 1) {
                        innerResponse = visitorCallback({ visitor: nrequest.visitor, method: 'treeEdge', request: { e: { u: searchStack[searchStack.length - 2][0], v: vertexIdV }, g: nrequest.digraph }});
                        if (innerResponse.error) {
                            errors.unshift(innerResponse.error);
                            break;
                        } else {
                            continueSearch = innerResponse.result;
                            if (!continueSearch) {
                                break;
                            }
                        }
                    }

                    // discoverVertex visitor callback.
                    innerResponse = visitorCallback({ visitor: nrequest.visitor, method: 'discoverVertex', request: { u: vertexIdV, g: nrequest.digraph }});
                    if (innerResponse.error) {
                        errors.unshift(innerResponse.error);
                        break;
                    }

                    continueSearch = innerResponse.result;

                    // Change the vertex's state to GRAY to record its discovery.
                    nrequest.options.traversalContext.colorMap[vertexIdV] = colors.gray;

                    if (!continueSearch) {
                        break;
                    }

                    // Examine adjacent vertices
                    var vertexOutEdges = nrequest.digraph.outEdges(vertexIdV);
                    var adjacentVertices = [];

                    while (vertexOutEdges.length && !errors.length && continueSearch) {

                        var adjacentVertex = vertexOutEdges.shift().v;

                        // examineEdge visitor callback.
                        innerResponse = visitorCallback({ visitor: nrequest.visitor, method: 'examineEdge', request: { e: { u: vertexIdV, v: adjacentVertex }, g: nrequest.digraph }});
                        if (innerResponse.error) {
                            errors.unshift(innerRepsonse.error);
                            break;
                        }
                        continueSearch = innerResponse.result;
                        if (!continueSearch) {
                            break;
                        }

                        var adjacentColor = searchContext_.colorMap[adjacentVertex];

                        switch (adjacentColor) {

                        case colors.white:
                            adjacentVertices.push(adjacentVertex);
                            break;
                        case colors.gray:
                            // backEdge visitor callback.
                            innerResponse = visitorCallback({ visitor: nrequest.visitor, method: 'backEdge', request: { e: { u: vertexIdV, v: adjacentVertex }, g: nrequest.digraph }});
                            if (innerResponse.error) {
                                errors.unshift(innerResponse.error);
                            } else {
                                continueSearch = innerResponse.result;
                            }
                            break;
                        case colors.black:
                            // forwardOrCrossEdge visitor callback.
                            innerResponse = visitorCallback({ visitor: nrequest.visitor, method: 'forwardOrCrossEdge', request: { e: { u: vertexIdV, v: adjacentVertex }, g: nrequest.digraph }});
                            if (innerResponse.error) {
                                errors.unshift(innerResponse.error);
                            } else {
                                continueSearch = innerResponse.result;
                            }
                            break;
                        }
                    }
                    if (adjacentVertices.length) {
                        searchStack.push(adjacentVertices);
                    }                                

                    break;

                case colors.gray:

                    // change the vertex's state to black to indicate search completion
                    searchContext_.colorMap[vertexIdV] = colors.black;

                    if ((visitorInterface_.finishVertex !== null) && visitorInterface_.finishVertex) {
                        continueSearch = verifyVisitorResponse(visitorInterface_.finishVertex(vertexIdV, digraph_));
                    }

                    var finishedVertexId = searchStack[searchStack.length - 1].shift();
                    if (!(searchStack[searchStack.length - 1].length)) {
                        searchStack.pop();
                    }
                    break;

                case colors.black:

                    // The black sheep. The only way for a vertex to end up in this state
                    // is for it to be queued after another adjacent vertex that reaches
                    // it first in the depth-first search tree. By definition it's already
                    // been 'finished'. 

                    if (searchStack.length > 1) {
                        if ((visitorInterface_.forwardOrCrossEdge !== null) && visitorInterface_.forwardOrCrossEdge) {
                            continueSearch = verifyVisitorResponse(visitorInterface_.forwardOrCrossEdge((searchStack[searchStack.length - 2])[0], vertexIdV, digraph_));
                        }
                    }

                    searchStack[searchStack.length - 1].shift();
                    if (!searchStack[searchStack.length - 1].length) {
                        searchStack.pop();
                    }
                    break;

                default:
                    errors.unshift("DFT failure: An invalid color value was found in the color map for vertex '" + vertexIdV + "'.");
                    break;
                }
            } // while search stack is not empty

            if (errors.length || !continueSearch) {
                break;
            }
            
        } // end while outer depth-first search loop

    } // while !inBreakScope

    if (errors.length) {
        if (nrequest) {
            nrequest.options.traverseContext.searchStatus = 'error';
        }
        errors.unshift("jsgraph.directed.depthFirstTravserse algorithm failure:");
        response.error = errors.join(' ');
    } else {
        nrequest.options.traverseContext.searchStatus = continueSearch?'completed':'terminated';
        response.result = nrequest.options.traverseContext;
    }
    return response;
    

};

