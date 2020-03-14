---
title: Agile methodology with Python I
published: true
description: |
    With new technologies and problems to solve,
    new methodologies have appeared structuring how
    we face and solve these new projects. The
    most applied, or at least one of the most 
    popular methodologies is Agile.
category: Python
ctime: 2018-05-19
---

## Story time

I had been working in a huge project - where huge means few years old project with big names behind - and I quite never felt the urge of taking the agile methods we implemented seriously, maybe because I was just getting started as a professional and facing other problems that kept my head busier, or maybe it was that the team was rather populated and it did not feel *agile* for me. However, with new projects appear new necessities, and now that I am working in a Big Data framework implementation (end-to-end data management and analytics) with just another colleague and a tight schedule comprised of 10 days *sprints*, I **must** know at what point we are to keep my brain at ease.

We use [Trello](https://trello.com/) as an organizing and checkpoint tool with the Product Owner, for its cards and boards systems is easy and fast to use. There are some *power-ups* already built to get a more in-depth view of how is the project advancing, but I like to make things and found a nice [API](https://github.com/sarumont/py-trello) for Python so I preffer to create something 100% adapted to my needs and with the possibility of scaling it.

## Code time

First, collect your API key and token from [here](https://trello.com/app-key) once you have signed in to your account. Secondly, start playing a bit with the API:

```python
import datetime
import pandas as pd
import numpy as np

import plotly.offline as py
import plotly.graph_objs as go
import plotly.figure_factory as ff

from trello import TrelloClient

py.init_notebook_mode(connected=True)

_PLOTLY_CONFIG = {"displaylogo": False,
                "modeBarButtonsToRemove": ["sendDataToCloud", "select2d", "lasso2d", "resetScale2d"]}

client = TrelloClient(
    api_key='<your-API-key>',
    token='<your-API-token>'
)
```

Take a look at all the boards and select the one you are interested in:

```python
client.list_boards()
```

    [<Board Bicing Prediction>,
	 <Board DeepLearning>,
	 <Board KAGGLE>,
	 <Board Kaggle Housing>,
	 <Board TFG>,
	 <Board Toxic Comments - DL>]

All objects have *Trello* types, like boards and cards. Obtain the different lists we have inside a board:

```python
my_board = get_board(all_boards, '<board-name>')
```

	 [<List TO DO>,
	 <List ONGOING>,
	 <List DONE>,
	 <List Backlog S01>,
	 <List STAND BY>,
	 <List INFO - Backlog S02>,
	 <List DONE S01>]

Feel free to explore the methods inside, as not only one can access the information, but also make comments or move cards with code. 

We are going to build a burn-down chart, so we are interested in what needs to be done and what we already did. We have a list with the Backlog of the sprint and a list with done tasks with the effort or points for each task are written inside parenthesis. However, most likely there will be the need of adding new cards on-the-go, so Backlog is usefull when checking the initial tasks considered, but you will need to sum the points of lists TO DO, ONGOING and DONE to get the real work values. We will define these cards names in our class later.

A key method we are using to retrieve the whole information in just one run without manually saving the project daily advanced by hand is the card's **list_movements()**. In there we have a list of dictionaries containing card movements accross lists:

```
{'source': 
    {'name': 'ONGOING', 'id': '5af068bff14b428c0476c77d'},
    'destination': {'name': 'DONE', 'id': '5afd8d9730531763ab3c3d04'}, 
    'datetime': datetime.datetime(2018, 5, 22, 17, 59, 49, 32000, tzinfo=tzutc())
}
```

If your Trello workflow is consistent, cards should be created at *TO DO*, and then moved to *ONGOING* and *DONE*. The code below checks for this last movement to retrieve the date and the card's points. If there are no movements in a specific day, value will be null (for example regarding weekends).

I am sure that this is highly optimizable, but it covered what I wanted and it does not take long (< 10 sec.).

```python
class trello_burndown:
    
    def __init__(self, client, board_name, 
    	         start_sprint, end_sprint):
        """
        Arguments:
        start_sprint/end_sprint: ex: '2018/05/15'
        """
        self.client = client
        self.board_name = board_name
        self.board = 0
        self.all_points = 0
        self.start_sprint = start_sprint
        self.end_sprint = end_sprint
        self.index = pd.date_range(start=start_sprint,
                              end=end_sprint)
        self.ts = pd.Series(index=self.index)

    def get_board(self):
        for board in self.client.list_boards():
            if board.name == self.board_name:
                self.board = board
        print('Using board {}.'.format(self.board.name))
        
    # We need to retrieve list id to access it
    def get_list(self, lname):
        for l in self.board.list_lists():
            if l.name == lname:
                list_id = l.id
                return self.board.get_list(list_id)
            
    def get_card_points(self, s, start='(', stop=')'):
        # Ignore cards without points
        try:
            point = s[s.index(start) + 1:s.index(stop)]
            return int(point)
        except:
            return 0
    
    def get_list_points(self, List):
        """
        Arguments: List is a Trello list object
        """
        points = 0
        for card in List.list_cards():
            points += self.get_card_points(card.name)
        return points
    
    def get_all_points(self, pos_cards):
        """
        Arguments:
        array = card name summing points
        ex: ['TO DO', 'ONGOING', 'DONE']
        """
        print('Cards adding points: {}.'.format(pos_cards))
        for card in pos_cards:
            trello_list = self.get_list(card)
            self.all_points += self.get_list_points(trello_list)
            
    def finished_points(self, neg_cards):
        """
        For every cardname specified to count
        as point retriever (i.e done tasks),
        get all tasks in the list and obtain
        the points for each task when it was 
        moved to DONE.
        ===================
        Arguments:
        array = card name summing points
        ex: ['DONE']
        """
        print('Cards with finished points: {}.'.format(neg_cards))
        for card in neg_cards:
            for l in self.get_list(card).list_cards():
                mov = l.list_movements()
                for dic in mov:
                    if dic['destination']['name'] == card:
                        date = dic['datetime'].date()
                        points = self.get_card_points(l.name)
                        if pd.isna(self.ts[date]):
                            self.ts[date]
                                = self.get_card_points(l.name)
                        else:
                            self.ts[date] 
                                += self.get_card_points(l.name)
    
    def calculate_remaining_points(self):
        """
        Using the calculated done points,
        get the remaining.
        """
        remaining_points = self.all_points
        for day, value in zip(self.index, self.ts):
            if not pd.isna(self.ts[day]):
                remaining_points -= self.ts[day]
                self.ts[day] = remaining_points
                
    def draw_chart(self):
        optimal = pd.Series(
                      [self.all_points, 0],
                      index=[pd.Timestamp(self.start_sprint),
                             pd.Timestamp(self.end_sprint)]
                  )
        
        print('Optimal sprint state:')
        print(optimal)
        real_trace = go.Scatter(x=self.ts.index, 
                        y=self.ts,
                        name='Remaining points',
                        line=dict(color='#17BECF'),
                        opacity=0.8)
        optim_trace = go.Scatter(x=optimal.index,
                        y=optimal,
                        name='Optimal points',
                        line=dict(color='#7F7F7F'),
                        opacity=0.8)
        
        layout = dict(title="S02 BurnDown Chart")
        fig = {"data": [real_trace, optim_trace],
               "layout": layout}

        py.iplot(fig, show_link=False, 
        	     config=_PLOTLY_CONFIG)
        
    def go_through_steps(self):
        self.get_board()
        self.get_all_points(['TO DO', 'ONGOING', 'DONE'])
        self.finished_points(['DONE'])
        self.calculate_remaining_points()
        self.draw_chart()

```

An example call and output:

```python
bd = trello_burndown(client, '<board-name>', 
	                 '2018/05/17', '2018/06/01')
bd.go_through_steps()
```

<img src="../../images/posts/python/agileI/burndown1.png" class="h-84 my-4 justify-center m-auto">

Hope you enjoyed it and found it useful. There are still much more project workload feedback and statistics one can extract using this API that might be fun to automatize.
