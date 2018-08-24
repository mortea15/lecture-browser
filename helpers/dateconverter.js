module.exports = function (date) {
  // Convert Mongo Date object to JavaScript Date object
  var dateObject = new Date(date)

  // Months of the year
  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ]
  // Days of the week
  const weekDays = [
    'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'
  ]

  if (dateObject) {
    var weekDay = weekDays[date.getDay()]
    var day = date.getDate()
    var month = months[date.getMonth()]

    return `${weekDay} ${day}. ${month} ${date.getFullYear()}`
  } else {
    return new Error('Missing date')
  }
}
