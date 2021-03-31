
// $(".loading-modal").modal('show')

// $.ajax({
//   type: 'GET',
//   url: `${mainUrl}/api/v1/attendance/get`,
//   headers: { "Authorization": accessToken },
//
//   success(res) {
//     console.log(res.data)
//     if (res.data.today) {
//       createDayAttendance(res.data.today.students, $(".today-attendance"), res.data.today.date)
//     } else {
//       $(".today-attendance").append(`
//         <div class="text-center"><a href="create" class="btn btn-outline-success">Davomat qilish ${convertDate(new Date())}</a></div>
//       `)
//     }
//
//     const elAttendanceContainer = $(".attendace-container").html(``)
//     for (const day of res.data.week) createDayAttendance(day.students, elAttendanceContainer, day.date)
//
//     updateElWidth()
//     centerVertical()
//     $(".loading-modal").modal('hide')
//   },
//   error(err) {
//     alert(JSON.stringify(err))
//     redirect("../")
//   }
// })
