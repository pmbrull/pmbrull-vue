---
title: Agile methodology with Python II
published: true
description: |
    In last post we introduced py-trello API and 
    showed one way of quickly getting a BurnDown
    chart on any Trello board we want, specifying
    in which cards we have positive and finished 
    points. However, in the way we implemented 
    things might seem scary...
category: Python
ctime: 2018-05-28
---

<img src="../../images/posts/python/agileII/burndown_bad.png" class="h-84 my-4 justify-center m-auto">

And also misleading. 

Problem here is that we are taking into account weekends, which in this graph act like we had several days without obtaining any results. Let's try to change this behaviour and only use workdays to have a vision that better fits reality. Another option could be only using days with card movement, assuming that, as we are working full time in these tasks, someone on the team will at least finish an easy task.

It has taken a while, as even when discarding weekends in the time series objects, those days are still shown in the plot. Finally, I came up with a solution that might not be the most elegant but gives us a better idea of the project's real state.

* When defining the class index, add *frequence* only business days:

```python
from pandas.tseries.offsets import BDay

self.index = pd.date_range(start=start_sprint,
                           end=end_sprint,
                           freq=BDay())
```

Which elimininates weekends when creating the Time Series storing the points.

* Instead of generating the Optimal Time Series with just sprint start and end points, with values of all_points and 0, use numpy **linspace** function to actually inform all points of interest.

```python
optim_val = np.linspace(self.all_points, 0, len(self.index))
optimal = pd.Series(optim_val, index=self.index)
```

* Now we have our data clean! However, plotly still gives us headaches as when using timestamps on x-axis, not even passed data points have their dates drawn. There is a [discussion](https://github.com/plotly/plotly.js/issues/99) going on about auto-formatting this issue, but i decided to go straight-forward and convert types. New traces have x-axis changed to integer list and look like this:

```python
real_trace = go.Scatter(x=list(range(len(self.ts.index))), 
                        y=self.ts,
                        name='Remaining points',
                        line=dict(color='#17BECF'),
                        opacity=0.8)

optim_trace = go.Scatter(x=list(range(len(optimal.index))),
                         y=optimal,
                         name='Optimal points',
                         line=dict(color='#7F7F7F'),
                         opacity=0.8)
```

Again, there may be better workarounds, but nevertheless, this one works and we can from this:

<img src="../../images/posts/python/agileII/burndown_bad.png" class="h-84 my-4 justify-center m-auto">

To this:

<img src="../../images/posts/python/agileII/burndown_good.png" class="h-84 my-4 justify-center m-auto">

Still, note how third data point is still blank. This is because it was a holiday in Barcelona :) Python has some tools to import festivities and even tune your own calendar, but I'll leave that for another day.
