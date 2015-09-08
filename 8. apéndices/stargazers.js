#!/usr/bin/env node

var createWriteStream = require('fs').createWriteStream
var parse             = require('url').parse
var request           = require('http').request
var stringify         = require('querystring').stringify

var GitHub = require('github')


const MILLISECONDS_PER_DAY = 24*60*60*1000

const HEADERS  = {Accept: 'application/vnd.github.v3.star+json'}
const PER_PAGE = 100

const USER = 'NodeOS'
const REPO = 'NodeOS'

var dates =
[
  '2014-02-24',  // Starred NodeOS
  '2014-06-10',  // First comment
  '2014-08-20',  // First commit
  '2014-11-06',  // NodeOS owner
  '2015-01-27',  // Meetup NodeJS Madrid
  '2015-05-08'   // Winner CUSL
]
var datesNodeos =
[
  '2013-09-15',  // Node NockOut
  '2014-09-10'   // Hacker News
]


function getRels(link)
{
  var result = {}

  link.split(', ').forEach(function(rel)
  {
    var matches = rel.match(/<(.+?)>; rel="(.+?)"/)

    var url = matches[1]
    var rel = matches[2]

    result[rel] =
    {
      page: parse(url, true).query.page,
      url: url
    }
  })

 return result
}


function stargazers(user, repo, options, callback)
{
  const github = new GitHub({version: "3.0.0"})

  var username = options.username
  var password = options.password

  if(username && password)
    github.authenticate(
    {
      type:     'basic',
      username: username,
      password: password
    })

  var page = 1
  var data = []

  function fetchData()
  {
    github.repos.getStargazers(
    {
      headers:  HEADERS,
      per_page: PER_PAGE,
      user:     user,
      repo:     repo,
      page:     page
    },
    function(error, res)
    {
      if(error) return callback(error)

      data = data.concat(res)

      var last = getRels(res.meta.link).last

      // There are more pages
      if(last)
      {
        console.log('Fetched page '+page+' of '+last.page)

        page++

        return fetchData()
      }

      callback(null, data)
    })
  }

  fetchData()
}


function starredDate(star)
{
  return star.starred_at.substr(0, 10)
}

function hist(prev, item)
{
  prev[item] = item in prev ? prev[item]+1 : 1

  return prev
}

function histToArray(object)
{
  return Object.keys(object).sort().map(function(date)
  {
    var result =
    {
      date: date,
      stargazers: object[date]
    }

    return result
  })
}

function accumulate(data)
{
  var sum = 0

  return data.map(function(entry)
  {
    entry.stargazers = sum += entry.stargazers

    return entry
  })
}


var options =
{
  username: process.argv[2],
  password: process.argv[3]
}

stargazers(USER, REPO, options, function(error, data)
{
  if(error) return console.trace(error)

  // Get accumulated number of stargazers
  data = data.map(starredDate).reduce(hist, {})
  data = accumulate(histToArray(data))

  // Craft data to generate chart with Google Charts API
  var days       = []
  var months     = []
  var years      = []
  var stargazers = []
  var events     = []

  data.forEach(function(entry, index)
  {
    var month = parseInt(entry.date.substr(5, 2))
    if(month != months[months.length-1])
    {
      var year = entry.date.substr(0, 4)
      year = (year !== years[years.length-1] && month === 1) ? year : ''

      if(months.length)
        while(months[months.length-1] < 12 && months[months.length-1]+1 != month)
        {
          months.push(months[months.length-1]+1)
          years.push('')
        }

      months.push(month)
      years.push(year)
    }

    days.push(new Date(entry.date))
    stargazers.push(entry.stargazers)

    if(dates[0] <= entry.date)
    {
      dates.shift()
      events.push('V,FF0000,0,'+index+',1')
    }
    if(datesNodeos[0] <= entry.date)
    {
      datesNodeos.shift()
      events.push('V,0000FF,0,'+index+',1')
    }
  })

  months.push(months[months.length-1]+1)
  years.push('')

  // Simplify days
  var offsetDays = days[0].setDate(1)  // First day of month of the stargazer
  days = days.map(function(day)
  {
    return (day.getTime() - offsetDays)/MILLISECONDS_PER_DAY
  })

  // Request chart
  var postData =
  {
    chd:  't:'+days.join(',')+'|'+stargazers.join(','),
    chds: 'a',
    chm:  'o,000000,0,-1,2'+'|'+events.join('|'),
    chs:  '800x375',
    cht:  'lxy',
    chxl: '0:|'+months.join('|'),
    chxt: 'x,y'
  }

  // Show years axis if data spawns for over more than a natural year
  for(var year in years)
    if(year !== '')
    {
      postData.chxl += '|2:|'+years.join('|')
      postData.chxt += ',x'
      break
    }

  postData = stringify(postData)

  var options =
  {
    hostname: 'chart.googleapis.com',
    path: '/chart',
    method: 'POST',
    headers:
    {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Content-Length': postData.length
    }
  }

  var req = request(options, function(res)
  {
    res.pipe(createWriteStream('stargazers.png'))
  })

  req.on('error', function(e)
  {
    console.log('problem with request: ' + e.message);
  })

  req.write(postData)
  req.end()
})
