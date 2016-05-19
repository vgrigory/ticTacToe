/**
 * Unit tests for - Leaderboard component
 *
 *
 * @module TicTacToe
 */
describe('Leaderboard directive', function () {
    var scope, element;
    var directiveTemplate = '<leaderboard></leaderboard>';

    beforeEach(module('TicTacToe'));

    beforeEach(inject(function($rootScope, $compile, $httpBackend) {
        scope = $rootScope.$new();

        // Leaderboard directive loads its template asynchronously,
        // thus we prefetch it here before each scenario.
        $httpBackend.expectGET('templates/leaderboard.html').respond();

        element = $compile(directiveTemplate)(scope);

        $httpBackend.flush();
        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
    }));


    it('test adding leaders', function () {
        var directiveScope = element.isolateScope();

        expect(directiveScope.leaders.length).toBe(0);

        directiveScope.$broadcast('game.finished.reset', [
            {'name': 'Vahagn', 'winCount': 0},
            {'name': 'Hayk', 'winCount': 1}
        ]);

        directiveScope.$broadcast('game.finished.wait', [
            {'name': 'Vahagn', 'winCount': 0},
            {'name': 'Hayk', 'winCount': 1}
        ]);

        expect(directiveScope.leaders.length).toBe(2);
        expect(directiveScope.leaders[1].name).toBe('Hayk');
        expect(directiveScope.leaders[1].winCount).toBe(2);

        directiveScope.$broadcast('game.finished.wait', [
            {'name': 'Mom', 'winCount': 0},
            {'name': 'Dad', 'winCount': 0}
        ]);

        expect(directiveScope.leaders.length).toBe(4);

        directiveScope.$broadcast('game.finished.wait', [
            {'name': 'Mom', 'winCount': 0},
            {'name': 'Hayk', 'winCount': 1}
        ]);

        expect(directiveScope.leaders[1].name).toBe('Hayk');
        expect(directiveScope.leaders[1].winCount).toBe(3);
    });
});