$(document).foundation();

var app = {
  // initialize app
  init: function(formSelector, listSelector) {
    $.ajax({
      url: 'https://xtern-roster.herokuapp.com/',
      method: 'get',
      success: function(sites) {
        app.people = sites.resources.people + '/';
        app.rivalries = sites.resources.rivalries + '/';
      },
    });
    this.form = $(formSelector);
    this.list = $(listSelector);
    this.getLocalStorage();
    this.setupEventListeners();
    // this.refreshRoster();
  },

  getLocalStorage: function() {
    var student-id = JSON.parse(localStorage.getItem('student-id'));
    if (student-id) {
      $.each(roster, function(i, student) {
        app.list.append(app.buildList(student.name, student.favorite));
      });
    }
  },
}
