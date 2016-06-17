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
    var roster = JSON.parse(localStorage.getItem('roster'));
    if (roster) {
      $.each(roster, function(i, student) {
        app.list.append(app.buildList(student.name, student.favorite));
      });
    }
  },

  setupEventListeners: function() {
    this.form.submit(this.addStudent.bind(this));
    this.form.find('#load').click(this.loadRoster.bind(this));
    this.form.find('#clear').click(this.clearRoster.bind(this));
  },

  // now build the actual list entry for each new name
  buildList: function(name, favorite, id) {
    var dl = $('<dl/>').attr({
      "data-id": id,
      "class": (function() {
          if (favorite)
            return "favorite";
          else return "";
      })(),
    });

    var li = $('<li/>');
    var dt = $('<dt/>').text(name);
    var dd = $('<dd/>');
    var ul = $('<ul/>').attr({"class": "button-group actions"});
    var editGroup = $('<li/>');
    // var moveGroup = $('<li/>');

    // create edit button
    var editLink = this.buildLink({
      contents: '<i class="fa fa-pencil fa-lg"></i>',
      href: "#",
      class: "edit button tiny radius secondary",
      handler: function() {
        // create edit field
        if ((editLink.attr("class") === "update button tiny radius success") &&
        ($('[name="editName"]').val().length)) {
          $.ajax({
            url: app.people + dl.attr('data-id'),
            method: 'patch',
            contentType: "application/json",
            data: JSON.stringify({
              "person": {
                "name": $('[name="editName"]').val(),
                "promoted": (function() {
                  return (dl.attr("class") === "favorite");
                })(),
              }
            }),
            success: function(data) {
              dt.text($('[name="editName"]').val());
              editLink.attr("class", "edit button tiny radius secondary");
              editLink.children().first().attr("class", "fa fa-pencil fa-lg");
            },
          });
        }
        else {
          dt.html($('<input/>').attr({
            name: "editName",
            type: "text",
            "class": "edit medium-6 columns",
            placeholder: "Enter Your Name",
            required: true,
          }).val(dt.text()));
          dt.children().first().focus().select();
          editLink.attr("class", "update button tiny radius success");
          editLink.children().first().attr("class", "fa fa-check fa-lg");
        }
      }
    });

    // create rivals button
    var rivalsLink = this.buildLink({
      contents: '<i class="fa fa-bomb fa-lg"></i>',
      href: "rivals.html",
      class: "rival button tiny radius secondary",
      handler: function() {
        localStorage.setItem("student-id", JSON.stringify(dl.attr("data-id")));
      }
    });

    // create delete button
    var deleteLink = this.buildLink({
      contents: '<i class="fa fa-trash-o fa-lg"></i>',
      href: "#",
      class: "remove button tiny radius alert",
      handler: function() {
        $.ajax({
          url: app.people + dl.attr('data-id'),
          method: 'delete',
          success: function() {
            app.list.slideUp();
            dl.remove();
            // app.refreshRoster();
            app.list.slideDown();
          },
        });
      }
    });

    // create favorite button
    var favoriteLink = this.buildLink({
      contents: '<i class="fa fa-star fa-lg"></i>',
      href: "#",
      class: "favorite button tiny radius",
      handler: function() {
        if (editLink.attr("class") === "edit button tiny radius secondary") {
          if (dl.attr("class") === "favorite") {
            $.ajax({
              url: app.people + dl.attr('data-id'),
              method: 'patch',
              contentType: "application/json",
              data: JSON.stringify({
                "person": {
                  "name": dt.text(),
                  "promoted": false,
                }
              }),
              success: function(data) {
                dl.removeClass("favorite");
              },
            });
          }
          else {
            $.ajax({
              url: app.people + dl.attr('data-id'),
              method: 'patch',
              contentType: "application/json",
              data: JSON.stringify({
                "person": {
                  "name": dt.text(),
                  "promoted": true,
                }
              }),
              success: function(data) {
                dl.addClass("favorite");
              },
            });
          }
        }
      }
    });

    // // create top button
    // var topLink = this.buildLink({
    //   contents: '<i class="fa fa-arrow-circle-up fa-lg"></i>',
    //   href: "#",
    //   class: "top button tiny radius",
    //   handler: function() {
    //     // move item to the top
    //     dl.insertBefore(dl.siblings().first());
    //     app.refreshRoster();
    //     app.saveList();
    //   }
    // });
    //
    // // create up button
    // var upLink = this.buildLink({
    //   contents: '<i class="fa fa-arrow-up fa-lg"></i>',
    //   href: "#",
    //   class: "up button tiny radius",
    //   handler: function() {
    //     // move item up one space
    //     var prevDL = dl.prev();
    //     if (prevDL.length) {
    //       dl.insertBefore(prevDL);
    //       app.refreshRoster();
    //       app.saveList();
    //     }
    //   }
    // });
    //
    // // create down button
    // var downLink = this.buildLink({
    //   contents: '<i class="fa fa-arrow-down fa-lg"></i>',
    //   href: "#",
    //   class: "down button tiny radius",
    //   handler: function() {
    //     // move item down one space
    //     var nextDL = dl.next();
    //     if (nextDL.length) {
    //       dl.insertAfter(nextDL);
    //       app.refreshRoster();
    //       app.saveList();
    //     }
    //   }
    // });

    // put it all together
    editGroup.append(editLink, rivalsLink, favoriteLink, deleteLink);
    // moveGroup.append(topLink, upLink, downLink);
    ul.append(editGroup);
    return dl.append(li.append(dt, dd.append(ul)));
  },

  buildLink: function(options) {
    return $('<a/>').attr({
      href: options.href,
      "class": options.class,
    }).html(options.contents)
      .click(options.handler);
  },

  // refreshRoster: function() {
  //   $('a.top, a.up, a.down').removeClass("disabled");
  //   $('dl:first-child a.top, \
  //      dl:first-child a.up, \
  //      dl:last-child a.down').addClass("disabled");
  // },

  // called on form submit
  addStudent: function(event) {
    event.preventDefault();
    this.list.slideUp();
    var studentName = this.form.find('[name="studentName"]');

    var dl = this.buildList(studentName.val(), false);
    this.list.append(dl);
    $.ajax({
      url: this.people,
      method: 'post',
      contentType: "application/json",
      data: JSON.stringify({
        "person": {
          "name": studentName.val(),
          "promoted": false,
        }
      }),
      success: function(data) {
        dl.attr('data-id', data.id);
        studentName.val('').focus();
        // this.refreshRoster();
      },
    });
    this.list.slideDown();
  },

  loadRoster: function(event) {
    this.list.slideUp();
    $.ajax({
      method: 'get',
      url: app.people,
      success: function(roster) {
        $.each(roster, function(i, student) {
          app.list.append(app.buildList(student.name, student.promoted, student.id));
        });
      },
    });
    this.list.slideDown();
  },

  clearRoster: function(event) {
    $.each(app.list.children(), function(i, dl) {
      $.ajax({
        url: app.people + dl.attr('data-id'),
        method: 'delete',
        success: function() {
          dl.remove();
          // app.refreshRoster();
        },
      });
    });
  },
};

app.init('#studentForm', '#studentList');
