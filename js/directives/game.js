TicTacToeApp.constant('GAME', {
    'STATE_NOT_STARTED': 0,
    'STATE_STARTED': 1,
    'STATE_FINISHED': 2,

    'MODAL_CLOSING_REASON_CANCEL': 0,
    'MODAL_CLOSING_REASON_OK': 1,
});

/**
 * Game directive
 *
 * Main directive of the application.
 * Ties togeather board and leaderboard components.
 *
 * Exposes following events (fired on $rootScope):
 * * "game.started"
 * * "game.finished.reset" - when game is finished and user requested a replay
 * * "game.finished.wait" - when game is finished, but user wants to review the game
 *
 * @module TicTacToe
 */
TicTacToeApp.directive('game', ['$rootScope', 'GAME', '$uibModal', function ($rootScope, GAME, $uibModal) {
    return {
        templateUrl: 'templates/game.html',
        scope: {},
        link: function (scope, element, attrs) {
            var gameState = GAME.STATE_NOT_STARTED;

            /**
             * Opens a modal dialog when game is finished,
             * displaying result to users.
             *
             * @method openModalDialog
             * @param {Object} data - data of the game: {'text': '', 'winnerOpponent': 0}
             * to be displayed in dialog
             *
             * @return void
             */
            function openModalDialog (data) {
                $uibModal.open({
                    animation: true,
                    templateUrl: 'gameResultModal.html',
                    controller: ['$scope', '$uibModalInstance', function ($gameResultModalScope, $uibModalInstance) {
                        $gameResultModalScope.text = data.text;

                        var eventData = [];

                        if (data.opponents) {
                            for (var i = 0; i < data.opponents.length; i++) {
                                eventData.push({
                                    'name': scope['opponent_' + data.opponents[i].id],
                                    'winCount': data.opponents[i].won ? 1 : 0
                                });
                            }
                        }

                        $gameResultModalScope.ok = function () {
                            $rootScope.$broadcast('game.finished.reset', eventData);
                            $uibModalInstance.close(GAME.MODAL_CLOSING_REASON_OK);
                        };

                        $gameResultModalScope.cancel = function () {
                            $rootScope.$broadcast('game.finished.wait', eventData);
                            $uibModalInstance.dismiss(GAME.MODAL_CLOSING_REASON_CANCEL);
                        };

                        $gameResultModalScope.$on('modal.closing', function (e, closingReason) {
                            if (closingReason !== GAME.MODAL_CLOSING_REASON_OK
                                && closingReason !== GAME.MODAL_CLOSING_REASON_CANCEL
                            ) {
                                $rootScope.$broadcast('game.finished.wait', eventData);
                            }
                        });
                    }],
                    size: 'sm'
                });
            }

            // handle events coming from board directive
            scope.$on('board.gameFinished.draw', function () {
                openModalDialog({
                    'text': 'Draw',
                    'opponents': [
                        {'id': 0, 'won': false},
                        {'id': 1, 'won': false}
                    ]
                });
            });

            scope.$on('board.gameFinished.win', function (e, result) {
                openModalDialog({
                    'text': 'Winner is: '
                            + scope['opponent_' + result.winnerOpponent]
                            + '. Congrats!',
                    'opponents': result.opponents
                });
            });

            scope.$on('board.currentOpponentChanged', function (e, opponent) {
                scope.currentOpponent = opponent;
            });


            // handle game events
            scope.$on('game.finished.reset', function () {
                scope.opponent_0 = scope.opponent_1 = '';
                scope.currentOpponent = -1;
                gameState = GAME.STATE_NOT_STARTED;
            });

            scope.$on('game.finished.wait', function () {
                gameState = GAME.STATE_FINISHED;
            });

            /**
             * Returns true when both opponents provided their names
             *
             * @method canStartGame
             *
             * @return boolean
             */
            scope.canStartGame = function canStartGame () {
                return !!(scope.opponent_0 && scope.opponent_1);
            }

            /**
             * Returns true when game is finished
             *
             * @method isGameFinished
             *
             * @return boolean
             */
            scope.isGameFinished = function isGameFinished () {
                return gameState === GAME.STATE_FINISHED;
            }

            /**
             * Returns true when game is started
             *
             * @method isGameStarted
             *
             * @return boolean
             */
            scope.isGameStarted = function isGameStarted () {
                return gameState === GAME.STATE_STARTED;
            }

            /**
             * Returns true when game is NOT started
             *
             * @method isGameNotStarted
             *
             * @return boolean
             */
            scope.isGameNotStarted = function isGameNotStarted () {
                return gameState === GAME.STATE_NOT_STARTED;
            }

            /**
             * Start the game.
             * When game is finished repoen the modal dialog,
             * so that user can reset and play again.
             *
             * @method startGame
             *
             * @return void
             */
            scope.startGame = function startGame () {
                if (scope.isGameFinished()) {
                    openModalDialog({
                        'text': 'In order to start new game click the button :)'
                    });
                    return;
                }

                gameState = GAME.STATE_STARTED;
                $rootScope.$broadcast('game.started');
            }
        }
    }
}]);