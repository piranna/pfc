#!/usr/bin/env node

var fs = require('fs')
var join = require('path').join

const DATA_DIR = 'performance'


fs.readdir(DATA_DIR, function(error, files)
{
  if(error) throw error

  var result = {}

  files.forEach(function(filename)
  {
    var fields = filename.split(' ')

    var machine = fields[0]
    var time    = fields[1]
    var kernel  = fields[2]
    var bits    = fields[3]

    if(kernel === 'NodeOS')
    {
      var file = JSON.parse(fs.readFileSync(join(DATA_DIR, filename), 'utf8'))

      for(var key in file)
      {
        var value = file[key]

        var benchmark = result[key]
        if(!benchmark)
          result[key] = benchmark = {}

        var name = filename
        benchmark[name] = parseFloat(value.ips.split('e')[0])
      }
    }
  })

  console.log(result)
})
