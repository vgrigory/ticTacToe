/**
 * Unit tests for - Board component
 *
 *
 * @module TicTacToe
 */
describe('Board directive', function () {
    var scope, element;
    var callbacks = {
        'boardGameFinishedWin': function (event, gameResult) {},
        'boardGameFinishedDraw': function () {}
    };
    var directiveTemplate = '<board board-state="1"></board>';

    beforeEach(module('TicTacToe'));

    beforeEach(inject(function($rootScope, $compile, $httpBackend) {
        scope = $rootScope.$new();

        // Board directive loads its template asynchronously,
        // thus we prefetch it here before each scenario.
        $httpBackend.expectGET('templates/board.html').respond();

        element = $compile(directiveTemplate)(scope);

        $httpBackend.flush();
        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();

        // creating stubs for opponent win and draw events and registering callbacks
        spyOn(callbacks, 'boardGameFinishedWin');
        spyOn(callbacks, 'boardGameFinishedDraw');
        $rootScope.$on('board.gameFinished.win', callbacks.boardGameFinishedWin);
        $rootScope.$on('board.gameFinished.draw', callbacks.boardGameFinishedDraw);
    }));


    it('opponent #1 starts & wins', function () {
        var directiveScope = element.isolateScope();

        directiveScope.selectCell({'x': 0, 'y': 0});
        directiveScope.selectCell({'x': 1, 'y': 1});
        directiveScope.selectCell({'x': 1, 'y': 0});
        directiveScope.selectCell({'x': 0, 'y': 2});
        directiveScope.selectCell({'x': 2, 'y': 0});
        expect(directiveScope.board[2][0]).toBe(0);

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
    });

    it('opponent #1 starts & draw', function () {
        var directiveScope = element.isolateScope();

        directiveScope.selectCell({'x': 0, 'y': 0});
        expect(directiveScope.board[0][0]).toBe(0);

        directiveScope.selectCell({'x': 1, 'y': 1});
        expect(directiveScope.board[1][1]).toBe(1);

        directiveScope.selectCell({'x': 2, 'y': 2});
        expect(directiveScope.board[2][2]).toBe(0);

        directiveScope.selectCell({'x': 1, 'y': 0});
        expect(directiveScope.board[1][0]).toBe(1);

        directiveScope.selectCell({'x': 2, 'y': 0});
        directiveScope.selectCell({'x': 2, 'y': 1});
        directiveScope.selectCell({'x': 0, 'y': 1});
        directiveScope.selectCell({'x': 0, 'y': 2});
        directiveScope.selectCell({'x': 1, 'y': 2});

        expect(callbacks.boardGameFinishedDraw).toHaveBeenCalledTimes(1);
        expect(callbacks.boardGameFinishedDraw).toHaveBeenCalled();

        // change directive template, so that in next scenario opponent #2 will start the game.
        directiveTemplate = '<board current-opponent="1" board-state="1"></board>';
    });

    it('opponent #2 starts & wins', function () {
        var directiveScope = element.isolateScope();

        directiveScope.selectCell({'x': 0, 'y': 0});
        directiveScope.selectCell({'x': 1, 'y': 1});
        directiveScope.selectCell({'x': 1, 'y': 0});
        directiveScope.selectCell({'x': 0, 'y': 2});
        directiveScope.selectCell({'x': 2, 'y': 0});

        expect(callbacks.boardGameFinishedWin).toHaveBeenCalledTimes(1);
        expect(callbacks.boardGameFinishedWin).toHaveBeenCalledWith(
            jasmine.any(Object),
            {
                'opponents': [
                    {'id': 1, 'won': true},
                    {'id': 0, 'won': false}
                ],
                'winnerOpponent': 1
            }
        );

        // reset template to default one
        directiveTemplate = '<board board-state="1"></board>';
    });

    it('check that selecting same cell twice, does not change previous selection', inject(function () {
        var directiveScope = element.isolateScope();

        directiveScope.selectCell({'x': 0, 'y': 0});
        directiveScope.selectCell({'x': 0, 'y': 0});
        expect(directiveScope.board[0][0]).toBe(0);

        directiveScope.selectCell({'x': 1, 'y': 0});
        directiveScope.selectCell({'x': 1, 'y': 0});
        expect(directiveScope.board[1][0]).toBe(1);

        // reset template to have inactive board for next step
        directiveTemplate = '<board></board>';
    }));

    it('test board states with reset functionality', function () {
        var directiveScope = element.isolateScope();

        expect(directiveScope.isBoardActive()).toBe(false);

        directiveScope.$broadcast('game.started');

        expect(directiveScope.isBoardActive()).toBe(true);

        directiveScope.selectCell({'x': 0, 'y': 0});
        directiveScope.selectCell({'x': 1, 'y': 1});
        directiveScope.selectCell({'x': 1, 'y': 0});
        directiveScope.selectCell({'x': 0, 'y': 2});
        directiveScope.selectCell({'x': 2, 'y': 0});
        expect(directiveScope.board[2][0]).toBe(0);

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

        directiveScope.$broadcast('game.finished.reset');
        expect(directiveScope.board[2][0]).toBe(-1);
        expect(directiveScope.isBoardActive()).toBe(false);
    });
});