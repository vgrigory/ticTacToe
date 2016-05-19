/**
 * Unit tests for - Game component
 *
 *
 * @module TicTacToe
 */
describe('Game directive', function () {
    var scope, element;
    var callbacks = {
        'gameStarted': function () {}
    };
    var directiveTemplate = '<game></game>';

    beforeEach(module('TicTacToe'));

    beforeEach(inject(function($rootScope, $compile, $httpBackend) {
        scope = $rootScope.$new();

        // Game directive loads its template asynchronously,
        // thus we prefetch it here before each scenario.
        $httpBackend.expectGET('templates/game.html').respond();

        element = $compile(directiveTemplate)(scope);

        $httpBackend.flush();
        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();

        // creating stubs
        spyOn(callbacks, 'gameStarted');
        $rootScope.$on('game.started', callbacks.gameStarted);
    }));


    it('test game states', function () {
        var directiveScope = element.isolateScope();

        expect(directiveScope.isGameNotStarted()).toBe(true);
        expect(directiveScope.canStartGame()).toBe(false);

        directiveScope.startGame();

        expect(callbacks.gameStarted).toHaveBeenCalledTimes(1);
        expect(directiveScope.isGameNotStarted()).toBe(false);
        expect(directiveScope.isGameStarted()).toBe(true);

        directiveScope.$broadcast('game.finished.reset');
        expect(directiveScope.isGameNotStarted()).toBe(true);

        directiveScope.$broadcast('game.finished.wait');
        expect(directiveScope.isGameFinished()).toBe(true);
    });
});