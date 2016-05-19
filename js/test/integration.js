/**
 * Integration tests
 *
 * @module TicTacToe
 */
describe('Integration tests', function () {
    var boardScope, leaderboardScope, gameScope;
    var boardElement,leaderboardElement, gameElement;

    var boardTemplate = '<board></board>';
    var leaderboardTemplate = '<leaderboard></leaderboard>';
    var gameTemplate = '<game></game>';

    var callbacks = {
        'boardGameFinishedWin': function (event, gameResult) {},
        'boardGameFinishedDraw': function () {},
        'boardOpponentChanged': function (event, opponent) {},
        'gameStarted': function () {},
        'gameFinishedReset': function () {},
        'gameFinishedWait': function () {}
    };

    beforeEach(module('TicTacToe'));

    beforeEach(inject(function($rootScope, $compile, $httpBackend) {
        boardScope = $rootScope.$new();

        $httpBackend.expectGET('templates/board.html').respond();

        boardElement = $compile(boardTemplate)(boardScope);

        $httpBackend.flush();
        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();

        spyOn(callbacks, 'boardGameFinishedWin');
        spyOn(callbacks, 'boardGameFinishedDraw');
        spyOn(callbacks, 'boardOpponentChanged');
        $rootScope.$on('board.gameFinished.win', callbacks.boardGameFinishedWin);
        $rootScope.$on('board.gameFinished.draw', callbacks.boardGameFinishedDraw);
        $rootScope.$on('board.currentOpponentChanged', callbacks.boardOpponentChanged);
    }));

    beforeEach(inject(function($rootScope, $compile, $httpBackend) {
        leaderboardScope = $rootScope.$new();

        $httpBackend.expectGET('templates/leaderboard.html').respond();

        leaderboardElement = $compile(leaderboardTemplate)(leaderboardScope);

        $httpBackend.flush();
        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
    }));

    beforeEach(inject(function($rootScope, $compile, $httpBackend) {
        gameScope = $rootScope.$new();

        $httpBackend.expectGET('templates/game.html').respond();

        gameElement = $compile(gameTemplate)(gameScope);

        $httpBackend.flush();
        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();

        spyOn(callbacks, 'gameStarted');
        spyOn(callbacks, 'gameFinishedReset');
        spyOn(callbacks, 'gameFinishedWait');
        $rootScope.$on('game.started', callbacks.gameStarted);
        $rootScope.$on('game.finished.reset', callbacks.gameFinishedReset);
        $rootScope.$on('game.finished.wait', callbacks.gameFinishedWait);
    }));

    it('test integration between game, board and leaderboard directives', inject(function ($rootScope) {
        var boardDirectiveScope = boardElement.isolateScope();
        var leaderboardDirectiveScope = leaderboardElement.isolateScope();
        var gameDirectiveScope = gameElement.isolateScope();

        // enter opponent names
        gameDirectiveScope.opponent_0 = 'Batman';
        gameDirectiveScope.opponent_1 = 'Superman';
        expect(gameDirectiveScope.canStartGame()).toBe(true);
        expect(boardDirectiveScope.isBoardActive()).toBe(false);

        // start the game, test that after game has started
        // corresponding events are fired both on game and board scopes
        gameDirectiveScope.startGame();
        expect(boardDirectiveScope.isBoardActive()).toBe(true);
        expect(callbacks.gameStarted).toHaveBeenCalledTimes(1);
        expect(callbacks.boardOpponentChanged).toHaveBeenCalledTimes(1);
        expect(callbacks.boardOpponentChanged).toHaveBeenCalledWith(jasmine.any(Object), 0);

        boardDirectiveScope.selectCell({'x': 0, 'y': 0});
        expect(callbacks.boardOpponentChanged).toHaveBeenCalledWith(jasmine.any(Object), 1);
        boardDirectiveScope.selectCell({'x': 1, 'y': 1});
        boardDirectiveScope.selectCell({'x': 1, 'y': 0});
        boardDirectiveScope.selectCell({'x': 0, 'y': 2});
        boardDirectiveScope.selectCell({'x': 2, 'y': 0});
        expect(boardDirectiveScope.board[2][0]).toBe(0);

        expect(callbacks.boardGameFinishedWin).toHaveBeenCalledTimes(1);
        expect(callbacks.boardGameFinishedWin).toHaveBeenCalledWith(
            jasmine.any(Object),
            {
                'opponents': [
                    {'id': 0, 'won': true},
                    {'id': 1, 'won': false}
                ],
                'winnerOpponent': 0
            }
        );

        // finish game
        $rootScope.$broadcast('game.finished.reset', [
            {'name': gameDirectiveScope.opponent_0, 'winCount': 1},
            {'name': gameDirectiveScope.opponent_1, 'winCount': 0}
        ]);

        // check that after game has been finished,
        // board and game directives have been returned to initial state
        expect(boardDirectiveScope.board[0][0]).toBe(-1);

        expect(gameDirectiveScope.canStartGame()).toBe(false);
        expect(boardDirectiveScope.isBoardActive()).toBe(false);

        expect(leaderboardDirectiveScope.leaders.length).toBe(2);
        expect(leaderboardDirectiveScope.leaders[0].name).toBe('Batman');
        expect(leaderboardDirectiveScope.leaders[0].winCount).toBe(1);
    }));
});