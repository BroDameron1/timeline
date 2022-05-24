let xLocation

const dummyData = [
    {
        year: 1,
        day: 187,
        height: 1,
        critical: false
    },
    {
        year: 0,
        day: 23,
        height: 1,
        critical: false
    },
    {
        year: 0,
        day: 24,
        height: 1,
        critical: false
    },
    {
        year: 2,
        day: 1,
        height: 1,
        critical: false
    },
    {
        year: 3,
        day: 320,
        height: 1,
        critical: false
    },
    {
        year: 5,
        day: 364,
        height: 3,
        critical: false
    },
    {
        year: 20,
        day: 180,
        height: 1,
        critical: false
    },
]

const renderChart = (dummyData) => {

    const totalYears = 100
    const zeroYear = 5
    const daysPerYear = 365
    let dataHolder = null //used to hold div data on a mouseover

    //sets the margins around the chart group.  This allows space for the labeling on the x and y axis
    const margin = {
        top: 20,
        right: 20,
        bottom: 20,
        left: 35

    }

    let svgWidth = window.innerWidth
    let svgHeight = window.innerHeight / 2.3

    //variables that calculate the height and width inside the margins
    const innerWidth = svgWidth - margin.left - margin.right
    const innerHeight = svgHeight - margin.top - margin.bottom



    //${Math.round((n%1)*100)}


    const xValue = d => {
        const dayAsDecimal = d.year + (+(Math.round((d.day / daysPerYear) + "e+3")  + "e-3")); //adds the year and the day (as a 3 digit decimal).
        //TODO: Use d3 number formatter to get 3 digit decimal?
        return dayAsDecimal
    } //takes each x data point and converts it to a string using the custom function in dummydata.js

    const yValue = d => d.height //takes each data point height attribute and sets it to yValue


    const xScale = d3.scaleLinear() //call the scaleBand function due to using an array of strings
        .domain(xLocation || [0,10]) //the domain is all entries for the x axis, in this case every year/day
        .range([0, innerWidth]) //sets the width of the scale within the canvas, in this from zero location to the total inner width


    const yScale = d3.scaleLinear()  //call the scaleLinear function due to using strictly numbers
        .domain([20, 0]) //sets the domain from zero to 20 (from bottom to top).  There is nothing significant about 20 and this range can be changed later.
        .range([0, innerHeight])  //sets the height of the scale from zero location to the total innerHeight



    d3.select('svg').remove()

    const svg = d3.select('#timeline-container')
        .append('svg')
            .attr('width', svgWidth)
            .attr('height', svgHeight)
            .attr('class', 'chart')

    svg.append('defs').append('clipPath')
        .attr('id', 'clip')
        .append('rect')
        .attr('width', innerWidth)
        .attr('height', innerHeight)


    const zoom = d3.zoom()
        .scaleExtent([1, 8])
        .translateExtent([
            [xScale(0), 0],
            [xScale(totalYears), 0]
          ])
        .on('zoom', zoomed)



    const g = svg.append('g') //creates a group with all "g" elements
        .attr('transform', `translate(${margin.left}, ${margin.top})`)


    const xAxisTickFormat = d => {
        if (d === zeroYear) {
            return `0 BBY/ABY`
        } else if (d < zeroYear) {
            return `${zeroYear - d} BBY`
        } else {
            return `${d - zeroYear} ABY`
        }
    }

    //creates the x axis
    const xAxis = d3.axisBottom() //executes axisBottom function which creates an axis with the ticks on the bottom.
        .scale(xScale) //sets the scale of the axis to the previously defined xScale
        .tickFormat(xAxisTickFormat) //sets what the ticks looks like based on the xAxisTickFormat

    const yAxis = d3.axisLeft() //creates the yaxis with the ticks to the left
        .scale(yScale) //sets the scale to the previously created y scale
        



    const xAxisG = g.append('g') //creates the x-axis group
        .style('clip-path', 'url(#clip)')
        .attr("class", "x-axis")
        .call(xAxis) //executes the xAxis function and adds it to the group
        .attr('transform', `translate(0, ${innerHeight})`) //moves the xaxis from the top to the bottom and puts it in the previously defined margin.

    // g.attr("transform", "translate(-239,281.956) scale(3.03)");

    const yAxisG = g.append('g').call(yAxis).remove() //creates and executes the y-axis group

    const eventDiv = d3.select("#event-div")
        .style('clip-path', 'url(#clip)')

    const eventLine = g.selectAll('body') //selects the body.  not sure why we have to select the body for lines
        .data(dummyData) //access the data
        .enter() //enters the new data
        .append('line') //creates a line for each data point
            .style('clip-path', 'url(#clip)')
            .style('stroke', 'black') //sets the line color
            .style('stroke-width', 1) //sets the line width
            .attr('x1', d => xScale(xValue(d))) //sets the start point of the line on the x-axis
            .attr('y1', d => yScale(yValue(d))) //sets the start point of the line on the y-axis
            .attr('x2', d => xScale(xValue(d))) //sets the end point of the line on the x-axis
            .attr('y2', innerHeight) //sets the end point of the line on the y-axis
            .attr('class', 'event-line') //sets the class of each line

    const eventPoint = g.selectAll('circle') //selects all circles within the 'g' group
        .data(dummyData) // accesses the data
        .enter()  //accesses the enter function to add new data
        .append('circle') //adds a circle for each new data point
            .style('clip-path', 'url(#clip)')
            .attr('cy', d => yScale(yValue(d))) //puts each circle on yaxis where it belongs
            .attr('cx', d => xScale(xValue(d))) //puts each circle on the xaxis where it belongs
            .attr('r', 5) //sets the radius to 5px
            .style("stroke","transparent")
            .style("stroke-width","30px")
            .attr('class', 'event-point') //sets the class of the circle
            .on('mouseenter', onMouseOver)
            .on('mouseleave', onMouseLeave)





    svg.call(zoom)
        //.call(zoom.translateTo, xScale(zeroYear), 0)

    function zoomed(event) {

        const updateX = event.transform.rescaleX(xScale)
        const zx = xAxis.scale(updateX)


        xAxisG.call(zx)
            .selectAll(".tick")
            .filter(e => e % 1)
            .remove();

        eventPoint
            .attr('cx', d => updateX(xValue(d)))
            .on('mouseenter', function(e, d) {
                const divWidth = document.querySelector('#event-div').offsetWidth;
                eventDiv
                    .style('opacity', 1)
                    .style('visibility', 'visible')
                    .style('transform', `translate(${updateX(xValue(d)) - ((divWidth - margin.left * 2) / 2)}px,${yScale(d.height) - 40}px)`)

                dataHolder = d
            })
            .on('mouseleave', onMouseLeave)


        eventLine
            .attr('x1', d => updateX(xValue(d)))
            .attr('x2', d => updateX(xValue(d)))


        if (dataHolder) {
            const divWidth = document.querySelector('#event-div').offsetWidth;
            eventDiv
                .style('transform', `translate(${updateX(xValue(dataHolder)) - ((divWidth - margin.left*2) / 2)}px,${yScale(dataHolder.height) - 40}px)`)
        }
    }



    function onMouseOver(event, d) {

        eventDiv
            .text(['test dasdasd dasdasd'])

        const divWidth = document.querySelector('#event-div').offsetWidth;

        eventDiv
            .style('transform', `translate(${xScale(xValue(d)) - ((divWidth - margin.left * 2) / 2)}px,${yScale(d.height) - 40}px)`)
            .transition()
            .duration(750)
            .style('opacity', 1)
            .style('visibility', 'visible')


        dataHolder = d
    }

    function onMouseLeave() {


        eventDiv
            .transition()
            .duration(750)
            .style('opacity', 0)

        setTimeout(function() {
            eventDiv
                .style('visibility', 'hidden')
        }, 750)
        

        dataHolder = null
    }

}

renderChart(dummyData) //renders the full chart, passes in the dummy data

window.addEventListener('resize', function(event){
    renderChart(dummyData)
})