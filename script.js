$(document).ready(function () {
    const employeeRef = db.collection("Cron");
    let deleteIDs = [];
    let lastVisibleEmployeeSnapShot = {};

    // GET TOTAL SIZE
    employeeRef.onSnapshot(snapshot => {
        let size = snapshot.size;
        $('.count').text(size);
        if (size == 0) {
            $('#selectAll').attr('disabled', true);
        } else {
            $('#selectAll').attr('disabled', false);
        }
    });


    // REAL TIME LISTENER
    employeeRef.limit(10).onSnapshot(snapshot => {
        let changes = snapshot.docChanges();
        changes.forEach(change => {
            if (change.type == 'added') {
                renderEmployee(change.doc);
            } else if (change.type == 'modified') {
                $('tr[data-id=' + change.doc.id + ']').remove();
                renderEmployee(change.doc);
            } else if (change.type == 'removed') {
                $('tr[data-id=' + change.doc.id + ']').remove();
            }
        });
        lastVisibleEmployeeSnapShot = snapshot.docs[snapshot.docs.length - 1];
    });

    // db.collection('employees').startAt("abc").endAt("abc\uf8ff").get()
    // .then(function (documentSnapshots) {
    //     documentSnapshots.docs.forEach(doc => {
    //         renderEmployee(doc);
    //     });
    // });

    // db.collection('employees').startAt('bos').endAt('bos\uf8ff').on("value", function(snapshot) {
    //     console.log(snapshot);
    // });

    // var first = db.collection("employees")
    //     .limit(3);

    // first.get().then(function (documentSnapshots) {
    //     documentSnapshots.docs.forEach(doc => {
    //         renderEmployee(doc);
    //     });
    //     lastVisible = documentSnapshots.docs[documentSnapshots.docs.length - 1];
    // });

    // DISPLAY
    function renderEmployee(document) {
        let item = `<tr data-id="${document.id}">
        <td>
            <span class="custom-checkbox">
                <input type="checkbox" id="${document.id}" name="options[]" value="${document.id}">
                <label for="${document.id}"></label>
            </span>
        </td>
        <td>${document.data().id}</td>
		<td>${document.data().mode}</td>
		<td>${document.data().instrumentType}</td>
		<td>${document.data().instrumentId}</td>
		<td>${document.data().side}</td>
		<td>${document.data().amount}</td>
		<td>${document.data().toZone}</td>
		<td>${document.data().cron}</td>
		<td>${document.data().endCron}</td>
        <td>
            <a href="#" id="${document.id}" class="edit js-edit-employee"><i class="material-icons" data-toggle="tooltip" title="Edit">&#xE254;</i>
            </a>
            <a href="#" id="${document.id}" class="delete js-delete-employee"><i class="material-icons" data-toggle="tooltip" title="Delete">&#xE872;</i>
            </a>
        </td>
    </tr>`;
        $('#employee-table').append(item);
        // Activate tooltip
        $('[data-toggle="tooltip"]').tooltip();
        // Select/Deselect checkboxes
        var checkbox = $('table tbody input[type="checkbox"]');
        $("#selectAll").click(function () {
            if (this.checked) {
                checkbox.each(function () {
                    console.log(this.id);
                    deleteIDs.push(this.id);
                    this.checked = true;
                });
            } else {
                checkbox.each(function () {
                    this.checked = false;
                });
            }
        });
        checkbox.click(function () {
            if (!this.checked) {
                $("#selectAll").prop("checked", false);
            }
        });
    }

    // ADD EMPLOYEE
    $("#add-employee-form").submit(function (event) {
        event.preventDefault();
        db.collection('Cron').add({
                id: $('#cron-id').val(),
				mode: $('#cron-mode').val(),
				instrumentType: $('#cron-instrumentType').val(),
				instrumentId: $('#cron-instrumentId').val(),
				side: $('#cron-side').val(),
				amount: $('#cron-amount').val(),
				toZone: $('#cron-toZone').val(),
				cron: $('#cron-cron').val(),
				endCron: $('#cron-endCron').val()
            }).then(function () {
                console.log("Document successfully written!");
                $("#addEmployeeModal").modal('hide');
            })
            .catch(function (error) {
                console.error("Error writing document: ", error);
            });
    });

    // DELETE EMPLOYEE
    $(document).on('click', '.js-delete-employee', function () {
        let id = $(this).attr('id');
        $('#delete-employee-form').attr('delete-id', id);
        $('#deleteEmployeeModal').modal('show');
    });

    $("#delete-employee-form").submit(function (event) {
        event.preventDefault();
        let id = $(this).attr('delete-id');
        if (id != undefined) {
            db.collection('Cron').doc(id).delete()
                .then(function () {
                    console.log("Document successfully delete!");
                    $("#deleteEmployeeModal").modal('hide');
                })
                .catch(function (error) {
                    console.error("Error deleting document: ", error);
                });
        } else {
            let checkbox = $('table tbody input:checked');
            checkbox.each(function () {
                db.collection('Cron').doc(this.value).delete()
                    .then(function () {
                        console.log("Document successfully delete!");
                    })
                    .catch(function (error) {
                        console.error("Error deleting document: ", error);
                    });
            });
            $("#deleteEmployeeModal").modal('hide');
        }
    });

    // UPDATE EMPLOYEE
    $(document).on('click', '.js-edit-employee', function () {
        let id = $(this).attr('id');
        $('#edit-employee-form').attr('edit-id', id);
        db.collection('Cron').doc(id).get().then(function (document) {
            if (document.exists) {
                $('#edit-employee-form #cron-id').val(document.data().id);
				$('#edit-employee-form #cron-mode').val(document.data().mode);
				$('#edit-employee-form #cron-instrumentType').val(document.data().instrumentType);
				$('#edit-employee-form #cron-instrumentId').val(document.data().instrumentId);
				$('#edit-employee-form #cron-side').val(document.data().side);
				$('#edit-employee-form #cron-amount').val(document.data().amount);
				$('#edit-employee-form #cron-toZone').val(document.data().toZone);
				$('#edit-employee-form #cron-cron').val(document.data().cron);
				$('#edit-employee-form #cron-endCron').val(document.data().endCron);
                $('#editEmployeeModal').modal('show');
            } else {
                console.log("No such document!");
            }
        }).catch(function (error) {
            console.log("Error getting document:", error);
        });
    });
	
	$(document).on('click', '.on-add-new-cron', function () {
        let id = $(this).attr('id');
        
        db.collection('Cron').doc("1").get().then(function (document) {
            if (document.exists) {
                $('#add-employee-form #cron-id').val(document.data().id);
				$('#add-employee-form #cron-mode').val(document.data().mode);
				$('#add-employee-form #cron-instrumentType').val(document.data().instrumentType);
				$('#add-employee-form #cron-instrumentId').val(document.data().instrumentId);
				$('#add-employee-form #cron-side').val(document.data().side);
				$('#add-employee-form #cron-amount').val(document.data().amount);
				$('#add-employee-form #cron-toZone').val(document.data().toZone);
				$('#add-employee-form #cron-cron').val(document.data().cron);
				$('#add-employee-form #cron-endCron').val(document.data().endCron);
                $('#addEmployeeModal').modal('show');
            } else {
                console.log("No such document!");
            }
        }).catch(function (error) {
            console.log("Error getting document:", error);
        });
    });

    $("#edit-employee-form").submit(function (event) {
        event.preventDefault();
        let id = $(this).attr('edit-id');
        db.collection('Cron').doc(id).update({
            id: $('#edit-employee-form #cron-id').val(),
			mode: $('#edit-employee-form #cron-mode').val(),
			instrumentType: $('#edit-employee-form #cron-instrumentType').val(),
			instrumentId: $('#edit-employee-form #cron-instrumentId').val(),
			side: $('#edit-employee-form #cron-side').val(),
			amount: $('#edit-employee-form #cron-amount').val(),
			toZone: $('#edit-employee-form #cron-toZone').val(),
			cron: $('#edit-employee-form #cron-cron').val(),
			endCron: $('#edit-employee-form #cron-endCron').val()
        });
        $('#editEmployeeModal').modal('hide');
    });

    $("#addEmployeeModal").on('hidden.bs.modal', function () {
        $('#add-employee-form .form-control').val('');
    });

    $("#editEmployeeModal").on('hidden.bs.modal', function () {
        $('#edit-employee-form .form-control').val('');
    });

    // PAGINATION
    $("#js-previous").on('click', function (e) {
        e.preventDefault();
        $('#employee-table tbody').html('');
        const queryPrevious = employeeRef
            .endBefore(lastVisibleEmployeeSnapShot)
            .limit(2);

        queryPrevious.get().then(snap => {
            snap.forEach(doc => {
                renderEmployee(doc);
            });
            lastVisibleEmployeeSnapShot = snap.docs[snap.docs.length - 1];
        });
    });

    $('#js-next').on('click', function (e) {
        e.preventDefault();
        if ($(this).closest('.page-item').hasClass('disabled')) {
            return false;
        }
        $('#employee-table tbody').html('');
        const queryNext = employeeRef
            .startAfter(lastVisibleEmployeeSnapShot)
            .limit(2);

        queryNext.get().then(snap => {
            snap.forEach(doc => {
                renderEmployee(doc);
            });
            lastVisibleEmployeeSnapShot = snap.docs[snap.docs.length - 1];
        });
    });

    // SEARCH
    $("#search-name").keyup(function () {
        $('#employee-table tbody').html('');
        let nameKeyword = $("#search-name").val();
        console.log(nameKeyword);
        employeeRef.orderByChild("name").startAt(nameKeyword).endAt(nameKeyword+"\uf8ff").get()
            .then(function (documentSnapshots) {
                documentSnapshots.docs.forEach(doc => {
                    renderEmployee(doc);
                });
            });
    });
});

// CENTER MODAL
(function ($) {
    "use strict";

    function centerModal() {
        $(this).css('display', 'block');
        var $dialog = $(this).find(".modal-dialog"),
            offset = ($(window).height() - $dialog.height()) / 2,
            bottomMargin = parseInt($dialog.css('marginBottom'), 10);

        // Make sure you don't hide the top part of the modal w/ a negative margin if it's longer than the screen height, and keep the margin equal to the bottom margin of the modal
        if (offset < bottomMargin) offset = bottomMargin;
        $dialog.css("margin-top", offset);
    }

    $(document).on('show.bs.modal', '.modal', centerModal);
    $(window).on("resize", function () {
        $('.modal:visible').each(centerModal);
    });
}(jQuery));
