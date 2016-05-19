TicTacToeApp.constant('BOARD', {
    // we suppose that tic tac toe board is a square ;)
    'LINEAR_SIZE': 3,

    'STATE_ACTIVE': 1,
    'STATE_NOT_ACTIVE': 0,

    // board cell possible values
    'CELL_FREE': -1, // the default
    'CELL_OPPONEN1_PLAYED': 0,
    'CELL_OPPONEN2_PLAYED': 1
})

/**
 * Board directive
 *
 * Holds entire logic, lifecycle of tic tac toe board concept.
 *
 * Exposes following events (fired on $rootScope):
 * * "board.gameFinished.draw" - fired without any data
 * * "board.gameFinished.win" - fired with winner opponent identifier
 * * "board.currentOpponentChanged" - fired when game started and when opponent is changed 
 *    with opponent identifier
 *
 * ** {'winnerOpponent': opponent}
 *
 * @module TicTacToe
 */
TicTacToeApp.directive('board', ['$rootScope', 'BOARD', function ($rootScope, BOARD) {
    /**
     * Indicates the opponent whos turn is at the moment.
     * possible values: 0, 1.
     * By default first opponent starts the game.
     * Configurable through 'current-opponent' directive attribute.
     * example: <board current-opponent="1"></board>
     *
     * @property currentOpponent
     * @type int
     * @default 0
     */
    var currentOpponent = 0;

    /**
     * Identifies state of the board, possible values: active, not active
     *
     * @property boardState
     * @type int
     * @default BOARD.STATE_NOT_ACTIVE
     */
    var boardState = BOARD.STATE_NOT_ACTIVE;

    /**
     * Number of all turns in a game
     *
     * @property numberOfFreeCells
     * @type int
     * @default BOARD.LINEAR_SIZE * BOARD.LINEAR_SIZE
     */
    var numberOfFreeCells = BOARD.LINEAR_SIZE * BOARD.LINEAR_SIZE;

    /**
     * 'Inverts' current opponent index.
     * If '0' is playing, it will become '1', and vice versa.
     *
     * @method changeOpponent
     * @return void
     */
    function changeOpponent () {
        currentOpponent = getOppositeOpponent();
        $rootScope.$broadcast('board.currentOpponentChanged', currentOpponent);
    }

    /**
     * Returns identifier of opposite opponent
     *
     * @method getOppositeOpponent
     * @return int
     */
    function getOppositeOpponent () {
        return 2 - currentOpponent - 1;
    }

    return {
        scope: {},
        templateUrl: 'templates/board.html',
        link: function (scope, element, attrs) {
            /**
             * 2-d array representing tic tac toe board,
             * where each cell value can be:
             * -1: free (not clicked/played)
             *  0: opponent 0 clicked
             *  1: opponent 1 clicked
             */
            scope.board = [];

            /**
             * Constructor of the directive
             */
            function init () {
                currentOpponent = 0;
                boardState = BOARD.STATE_NOT_ACTIVE;

                currentOpponent = parseInt(attrs['currentOpponent'] ? attrs['currentOpponent'] : currentOpponent);
                boardState = parseInt(attrs['boardState'] ? attrs['boardState'] : boardState);

                numberOfFreeCells = BOARD.LINEAR_SIZE * BOARD.LINEAR_SIZE;

                var x, y;
                for (x = 0; x < BOARD.LINEAR_SIZE; x++) {
                    scope.board[x] = [];
                    for (y = 0; y < BOARD.LINEAR_SIZE; y++) {
                        scope.board[x][y] = BOARD.CELL_FREE;
                    }
                }
            };

            init();

            /**
             * Return true if the cell is unplayed yet
             *
             * @method isCellSelectedByOpponent
             * @param {int} opponent - opponent identifier (either 0 or 1)
             * @param {Object} cell - {x, y} object
             * @return boolean
             */
            function isCellSelectedByOpponent (opponent, cell) {
                return scope.board[cell.x][cell.y] === opponent;
            }

            /**
             * Return true if there are more turns for opponents to play
             *
             * @method areThereFreeCellsLeft
             * @return boolean
             */
            function areThereFreeCellsLeft () {
                return numberOfFreeCells > 0;
            }

            /**
             * Generates function which loops through cells (cell chain) generated by cellGenerator().
             * Then checks if all cells in a chain are played by opponent he/she won.
             *
             *
             * @method hasOpponentWonWithCellChainFactory
             * @param {int} opponent
             * @param {function} cellGenerator - function which receives iterator index and generates cell object
             * (holds a logic for generating cells of certain alignment: e.g. cells aligned horizontally matching
             * "x" coordinate of cell selected by opponent)
             *
             * @return boolean
             */
            function hasOpponentWonWithCellChainFactory (opponent, cellGenerator) {
                return function () {
                    var i;
                    var container = [];

                    for (i = 0; i < BOARD.LINEAR_SIZE; i++) {
                        var cell = cellGenerator(i);

                        if (isCellSelectedByOpponent(getOppositeOpponent(), cell)) {
                            container = [];
                            break;
                        }

                        if (isCellSelectedByOpponent(opponent, cell)) {
                            container.push(cell);
                        }
                    }

                    if (container.length === BOARD.LINEAR_SIZE) {
                        return true;
                    }

                    return false;
                }
            }

            /**
             * Checks whether opponent won after clicking on a cell.
             *
             *
             * @method hasOpponentWonWithCell
             * @param {int} opponent - opponent identifier
             * @param {Object} targetCell - cell selected by opponent
             *
             * @return boolean
             */
            function hasOpponentWonWithCell (opponent, targetCell) {
                var opponentWinCalculators = [];

                // check horizontally
                opponentWinCalculators.push(hasOpponentWonWithCellChainFactory(opponent, function (iteratorIndex) {
                    return {"x": iteratorIndex, "y": targetCell.y};
                }));

                // check vertically
                opponentWinCalculators.push(hasOpponentWonWithCellChainFactory(opponent, function (iteratorIndex) {
                    return {"x": targetCell.x, "y": iteratorIndex};
                }));

                // check backslash diagonal (in case cell is placed on it)
                if (targetCell.x === targetCell.y) {
                    opponentWinCalculators.push(hasOpponentWonWithCellChainFactory(opponent, function (iteratorIndex) {
                        return {"x": iteratorIndex, "y": iteratorIndex};
                    }));
                }

                // check slash diagonal (in case cell is placed on it)
                if (targetCell.x + targetCell.y === BOARD.LINEAR_SIZE - 1) {
                    opponentWinCalculators.push(hasOpponentWonWithCellChainFactory(opponent, function (iteratorIndex) {
                        return {"x": BOARD.LINEAR_SIZE - 1 - iteratorIndex, "y": iteratorIndex};
                    }));
                }

                for (i = 0; i < opponentWinCalculators.length; i++) {
                    var hasOpponentWonWithCellChain = opponentWinCalculators[i];

                    if (hasOpponentWonWithCellChain()) {
                        $rootScope.$broadcast(
                            'board.gameFinished.win',
                            {
                                'opponents': [
                                    {'id': opponent, 'won': true},
                                    {'id': getOppositeOpponent(), 'won': false}
                                ],
                                'winnerOpponent': opponent
                            }
                        );

                        return true;
                    }
                }

                return false;
            }

            /**
             * Return true if board is active and the cell is unplayed yet
             *
             * @method isCellSelectable
             * @return boolean
             */
            scope.isCellSelectable = function isCellSelectable (cell) {
                return boardState === BOARD.STATE_ACTIVE
                    && scope.board[cell.x][cell.y] === BOARD.CELL_FREE
                    ;
            }

            /**
             * Return true if board is active
             *
             * @method isBoardActive
             * @return boolean
             */
            scope.isBoardActive = function isBoardActive () {
                return boardState === BOARD.STATE_ACTIVE;
            }

            /**
             * Checks whether opponent won after clicking on a cell.
             *
             *
             * @method selectCell
             * @param {Object} cell - cell to select for opponent
             *
             * @return boolean
             */
            scope.selectCell = function selectCell (cell) {
                // step 1) check if opponent can click on a cell
                if (!scope.isCellSelectable(cell)) {
                    return;
                }

                // step 2) select the cell
                scope.board[cell.x][cell.y] = currentOpponent;

                // step 3) check if opponent won after clicking on a cell
                if (hasOpponentWonWithCell(currentOpponent, cell)) {
                    return;
                }

                // step 4) decrease number of turns left
                numberOfFreeCells--;

                // steps 5) if there are more turns, change the players
                if (areThereFreeCellsLeft()) {
                    changeOpponent();
                } else {
                    // steps 6) otherwise game is finished with a draw
                    $rootScope.$broadcast('board.gameFinished.draw');
                }
            }

            scope.$on('game.started', function () {
                boardState = BOARD.STATE_ACTIVE;
                $rootScope.$broadcast('board.currentOpponentChanged', currentOpponent);
            });

            scope.$on('game.finished.reset', function () {
                init();
            });

            scope.$on('game.finished.wait', function () {
                boardState = BOARD.STATE_NOT_ACTIVE;
            });
        }
    }
}]);