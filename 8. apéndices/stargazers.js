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

function getChx(begin, end)
{
  begin = new Date(begin)

  var months = []
  var years  = []

  while(begin <= end)
  {
    if(begin.getDate() === 1)
    {
      months.push(begin.getMonth()+1)
      years.push(begin.getMonth() === 0 ? begin.getFullYear() : '')
    }
    else
      months.push('')

    begin.setDate(begin.getDate()+1)
  }

  var result =
  {
    chxl: '0:|'+months.join('|'),
    chxt: 'x,y'
  }

  // Show years axis if data spawns for over more than a natural year
  for(var year in years)
    if(year !== '')
    {
      result.chxl += '|2:|'+years.join('|')
      result.chxt += ',x'
      break
    }

  return result
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
  var stargazers = []
  var events     = []

  data.forEach(function(entry, index)
  {
    days.push(new Date(entry.date))
    stargazers.push(entry.stargazers)

    // [ToDo] Allow to add events on days without data
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

  // Simplify dates
  var daysBegin = new Date(days[0])
  var daysEnd   = new Date(days[days.length-1])

  daysBegin.setDate(1)  // First day of month of the first stargazer
  if(daysEnd.getDate() !== 1)
    daysEnd.setMonth(daysEnd.getMonth()+1, 1)  // First day of next month of the last stargazer

  // Generate months and years
  var chx = getChx(daysBegin, daysEnd)

  // Get days from beginning of data
  days = days.map(function(day)
  {
    return (day.getTime() - daysBegin)/MILLISECONDS_PER_DAY
  })

  // Request chart
  var lastDay = days[days.length-1]
  var postData =
  {
    chd:  't:'+days.join(',')+'|'+stargazers.join(','),
    chds: 'a',
    chm:  'o,000000,0,-1,2'+'|'+events.join('|'),
    chs:  lastDay+'x'+Math.floor(300000/lastDay),
    cht:  'lxy',
    chxl: chx.chxl,
    chxt: chx.chxt
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
    if(res.statusCode !== 200) throw res.statusCode+': '+res.statusMessage

    res.pipe(createWriteStream('stargazers.png'))
  })

  req.on('error', function(e)
  {
    console.log('problem with request: ' + e.message);
  })

  req.write(postData)
  req.end()
})
