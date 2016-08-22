function gridLayout() {}

/**
 * This source code is licensed under the GPLv3 License.
 * Author: Alexei Nekrasov (znbiz, E-mail: nekrasov.aleks1992@gmail.com)
 */

gridLayout.calculate = function(nodes, edges, size) {
    /**
     * Each node number is put into correspondence with an array of numbers of neighboring vertex
     * @param {array} number_nodes_label - an array where each vertex name is associated its number
     */
    function Neighbors(number_nodes_label){
        var mas = [];
        var edges_temp = JSON.parse(JSON.stringify(edges));

        /*
        Remove the are multiples of ribs and loops
         */
        var temp = {};
        var temp1 = [];
        for(var i = 0; i < edges_temp.length; i++){
            if(temp[edges_temp[i].target.label] != edges_temp[i].source.label){ 
                temp[edges_temp[i].source.label] = edges_temp[i].target.label;
                temp1.push(edges_temp[i]);
            } 
        }
        edges_temp = temp1;

        for(var i = 0; i < nodes.length; i++){
            var neighbors = [];
            var k = 0;
            for(var j = 0; j < edges_temp.length; j++){
                var t = edges_temp[j].target.label;
                var s = edges_temp[j].source.label
                if (number_nodes_label[t] == i){
                    neighbors[k++] = number_nodes_label[s];
                } else if (number_nodes_label[s] == i){
                    neighbors[k++] = number_nodes_label[t]
                }
            }
            mas[i] = neighbors;
        }
        return mas;
    }
    
    /**
     * The function finds the optimal path from a point to all 
     * other points of the graph, also gives the optimum distance to all other points.
     * @param {array} visited          - Boolean array attending top of yes or no
     * @param {array} d                - array lengths optimal paths to the heights
     * @param {number} k               - distance from a given initial vertex
     * @param {array} neighbors        - an array of arrays containing the neighbors of each vertex
     * @param {array} queue_neighbors  - all vertex whose neighbors will check if they are not already checked
     * @param {array} path             - the path from the initial vertex to each vertex
     */
    function DijkstrasAlgorithm(visited, d, k, neighbors,queue_neighbors,path){
        var queue_temp = [];
        for(var i = 0; i < queue_neighbors.length; i++){
            if(!visited[queue_neighbors[i]]){  // If this node is not visited that go into it.
                visited[queue_neighbors[i]] = true; 
                for(var j = 0; j < neighbors[queue_neighbors[i]].length; j++){
                    if(d[neighbors[queue_neighbors[i]][j]] > k){
                        for(var temp = 0; temp < path[queue_neighbors[i]].length; temp++){
                            path[neighbors[queue_neighbors[i]][j]].push(path[queue_neighbors[i]][temp]);
                        }
                        path[neighbors[queue_neighbors[i]][j]].push(queue_neighbors[i]);
                        d[neighbors[queue_neighbors[i]][j]] = k;
                    }
                    queue_temp.push(neighbors[queue_neighbors[i]][j]);
                }
            }
        }
        queue_neighbors = JSON.parse(JSON.stringify(queue_temp));
        if(queue_neighbors.length){
            DijkstrasAlgorithm(visited, d, k+1, neighbors,queue_neighbors, path);
        }
    }

    /**
     * Start function to bypass the graph width (Dijkstra's algorithm)
     * @param {array} neighbors - an array of arrays containing the neighbors of each vertex
     * @return {array} It returns an array containing two other array: An array of "special numbers": [nodes_number: SpN, ...]
     * and an array of lengths of optimal routes between all vertices
     */
    function MainDijkstrasAlgorithm(neighbors){
        /*
         An array of "special numbers": [nodes_number: SpN, ...]
         */
        var weight_nodes = []; 

        /*
         An array of lengths of optimal routes between all vertices
         */
        var matrix_length = [];

        /*
         Initialize the output variables
         */
        for(var i = 0; i < nodes.length; i++){
            weight_nodes[i] = 0;
            var temp = [];
            for(var j = 0; j < nodes.length; j++){
                temp[j] = 0;
            }
            matrix_length[i] = temp;
        }

        /*
         Start the crawl count width for each vertex
         */
        for (var i = 0; i < nodes.length; i ++){
            /*
             An array of visited nodes
             */
            var visited = [];
            /*
             An array of lengths of optimal paths from vertex i to all other
             */
            var d = [];
            /*
             An array of the best ways of vertex i to all other
             */
            var path = {};
            /*
             Initialize variables
             */
            for(var j = 0; j < nodes.length; j++){
                visited[j] = false; // initial list of visited nodes is empty
                d[j] = 2000000;
                path[j] = [];
            }
            d[i] = 0;
            var queue_neighbors = [];
            queue_neighbors.push(i);

            DijkstrasAlgorithm(visited, d, 1, neighbors,queue_neighbors, path);

            /*
             We take out of "path" set of weights
             */
            for(var j in path){
                for(var k = 0; k < path[j].length; k++){
                    var node_temp = path[j][k];
                    weight_nodes[node_temp]++;
                }
            }
            /*
             Fill the matrix lengths optimal ways
             */
            for(var j = 0; j < d.length; j++){
                matrix_length[i][j] = d[j];
            }
        }
        /*
         average the results
         */
        for(var i = 0; i < weight_nodes.length; i++){
            weight_nodes[i] /= (nodes.length-1);
        }

        return [weight_nodes, matrix_length];
    }

    /**
     * Функция создаёт массив координат упорядоченных по приближённости к центру
     * 1.1) По количеству точек nodes_number вычисляем радиус окружности, в которую поместятся все точки
     * 1.2) Вписываем данную окружность в минимальный квадрат с целочисленной длинной стороны
     * 1.3) Проверяем каждую вершину квадрата по следующему признаку, входит ли она в круг?
     * 1.4) Если точка входит в круг, запоминаем её координаты и расстояние до центра
     * @param  {number} nodes_number - количество узлов в графе
     * @return {array} Возращает массив содержащий массивы следующего типа 
     * [{location: ["x" , "y"], length: "number"}...]. Каждому элементу массива сопоставлен набор точек которых находятся 
     * на опренном расстояния от цетра. Пример: для элемента 4 это все точки, которые лежат на расстояние от центра от 3 до 4.
     */
    function coordinates_for_location_nodes (nodes_number) {
        var r = Math.sqrt(Math.floor(nodes_number / 3.14) + 1);
        var a_querty = (Math.floor(r) + 1); // половина стороны квадрата

        var result_location = [];

        for (var i = 0; i <= Math.floor(r) + 1; i++) {
            result_location[i] = [];
        }

        for (var i = 0; i <= a_querty; i++) {
            for (var j = 0; j <= a_querty; j++) {
                var length = Math.sqrt(i * i + j * j);
                if (length <= r) {
                    var location_node = {length: 0, location: [0,0]};
                    if ((i == 0) && (j == 0)) {
                        result_location[0].push(location_node);
                    } else if (i == 0) {
                        location_node.length = length;
                        location_node.location = [0, j];
                        result_location[j].push(location_node);
                        location_node.location = [0, -j];
                        result_location[j].push(location_node);
                    } else if (j == 0) {
                        location_node.length = length;
                        location_node.location = [i, 0];
                        result_location[i].push(location_node);
                        location_node.location = [-i, 0];
                        result_location[i].push(location_node);
                    } else {
                        var k_r = Math.floor(length) + 1;
                        location_node.length = length;
                        location_node.location = [i, j];
                        result_location[k_r].push(location_node);
                        location_node.location = [i, -j];
                        result_location[k_r].push(location_node);
                        location_node.location = [-i, j];
                        result_location[k_r].push(location_node);
                        location_node.location = [-i, -j];
                        result_location[k_r].push(location_node);
                    }
                }
            }
        }

        for (var i = 0; i <= Math.floor(r) + 1; i++) {
            result_location[i].sort( function (a,b) { return a.length > b.length; });
        }

        return result_location;
    }

    var time = Date.now();
    ///////////////////////////////////////////////////////////////////////////////////////////////
    /// main
    ///////////////////////////////////////////////////////////////////////////////////////////////
    var size_temp =  Math.sqrt(nodes.length);

    var coordinate = coordinates_for_location_nodes(nodes.length)

    /*
    An associative array of vertex indices of names
     */
    var number_nodes_label = {};
    for(var i = 0; i < nodes.length; i++){
        number_nodes_label[nodes[i].label] = i;
    }

    var neighbors = Neighbors(number_nodes_label);
    
    var result = MainDijkstrasAlgorithm(neighbors);

    // console.log(result)
    console.log(Date.now() - time)
    for(var i = 0; i < nodes.length; i++){
        nodes[i].x = i;
        nodes[i].y = i;
    } 

}