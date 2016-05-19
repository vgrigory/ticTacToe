/**
 * Leaderboard directive
 *
 * Holds entire logic, lifecycle of tic tac toe leaderboard concept.
 *
 * @module TicTacToe
 */
TicTacToeApp.directive('leaderboard', ['$rootScope', function ($rootScope) {
    return {
        scope: {},
        templateUrl: 'templates/leaderboard.html',
        link: function (scope, element, attrs) {
            /**
             * Adds leadersto leaderboard
             *
             * @method addLeaders
             * @param {Array} leader - array of objects ({'name': '', 'winCount': 0}) of game leaders
             *
             * @return void
             */
            function addLeaders (leaders) {
                var i;
                for (i = 0; i < leaders.length; i++) {
                    var leaderIndex = getLeaderIndexByName(leaders[i].name);

                    if (leaderIndex === -1) {
                        scope.leaders.push({
                            'name': leaders[i].name,
                            'winCount': leaders[i].winCount
                        });
                    } else {
                        scope.leaders[leaderIndex].winCount += leaders[i].winCount;
                    }
                }
            }

            /**
             * Finds a leader by his/her name
             *
             * @method getLeaderIndexByName
             * @param {String} name - nameof the leader to look for
             *
             * @return int 0 based index of leader if found, otherwise -1
             */
            function getLeaderIndexByName (name) {
                for (i = 0; i < scope.leaders.length; i++) {
                    if (scope.leaders[i].name === name) {
                        return i;
                    }
                }

                return -1;
            }

            scope.leaders = [];

            scope.$on('game.finished.reset', function (e, opponents) {
                addLeaders(opponents);
            });

            scope.$on('game.finished.wait', function (e, opponents) {
                addLeaders(opponents);
            });
        }
    }
}]);