---
title: "Some Quotes"
date: "2025-01-15"
category: "technical"
excerpt: "This is a test article"
---
&nbsp;  
# The Quote Component&nbsp;  
&nbsp;  
## Published 03/17/2025
## Last Updated 03/20/2025&nbsp;  
&nbsp;  
### Technical Overview
### Andy Bui

&nbsp;&nbsp;&nbsp;&nbsp;*Hello!* I'd like to talk to you about one of my favorite fixtures of this website, *the Quote Component.* You can find it on this page by closing this article. It fetches a random quote from a list of, at the time of this writing, around 50 quotes compiled by myself from various sources, mostly *SID MEIER'S CIVILIZATION 4-6.*&nbsp;  
&nbsp;  
&nbsp;&nbsp;&nbsp;&nbsp;In creating this interface, the prevailing challenge for me was that of designing for mobile versus desktop. To me, it often feels that the two are at odds with one another---namely in that mobile viewports never have enough space, yet desktop viewports have too much! This was most apparent for where I keep my weblog. Opening a default article isn't ideal as it would mess with engagement metrics, so as somewhat of an intermediate space, I created *the quote component*.&nbsp;  
&nbsp;  
&nbsp;&nbsp;&nbsp;&nbsp;Although on the surface this is pretty innocuous, there's a lot about the component that puts it at the center of how things are operating on the serverside. An example of this is how it interfaces with Amazon S3 via the backend API. The quotes are kept in a single JSON file, alongside all of the other static resources for this website in an S3 bucket. Its contents look like this:
```json
                                                              
{                                                             
    "quotes":                                                 
        [                                                     
            {                                                 
            "content": "I am fond of pigs. Dogs look up...",  
            "author": "Winston S. Churchill"                  
            },                                                
            ...                                               
        ]                                                     
    }                                                         
                                                              
```
&nbsp;&nbsp;&nbsp;&nbsp;So, we have the key of *quotes*, of which its corresponding value is an array. Each item in this array is a dictionary containing two key-value pairs: the quote, and its attributed author. It's convenient to keep these separate, as the frontend deals with them differently: the quote text is center-aligned, while the author text is right-aligned.&nbsp;  
&nbsp;  
&nbsp;&nbsp;&nbsp;&nbsp;To deliver a random quote to the client, a call to the API is made at the endpoint /api/quotes/random/ which trigger the following actions serverside:
1. The application gets an object from S3 using the *boto3* client, the official Amazon Web Services SDK. In this case, the object is a JSON file.
```python
                                                              
  # excluding configuration of s3_client
  bucket = "my_s3_bucket"
  key = "my_static_resource"
  obj = s3_client.get_object(Bucket=bucket, Key=key)       
  content = obj["Body"].read().decode("utf-8")             
                                                              
```
2. This object is converted into a dictionary, so that we can access and manipulate its contents. We take the array of quotes and assign it to, very appropriately, *quotes*.
```python
                                                              
  result = json.loads(content)                                
  quotes = result['quotes']                                   
                                                              
```
3. Now that we have every quote in the form of a list, we need to figure out how this gets to the client in the form of a single, "random" quote. This step is optional, if not overkill, but is kind of an interesting topic to me––feel free to skip to step 4.&nbsp;  
&nbsp;  
*I use a combination of the secrets and random modules to generate a random number, although in this case the former is sort of overkill (*secrets* module interfaces with the operating system to generate crytographically secure random numbers, while *random* uses pseudo-RNG)&nbsp;  
&nbsp;  
By using secrets module to generate a seed for random module in the range [0 , 31], we are creating 32 possible outcomes of shuffling quotes. This is fine for my usecase, but you may find that for something like a game, PRNG with random is appropriate, while true random number generation is best suited for actual secrets.*
```python
                                                              
  randomseed = secrets.randbelow(32)                          
  random.seed(randomseed)                                     
                                                              
```
4. We can represent the standard order of quotes with an array of integers 0 to (n - 1), where *n* is the total number of quotes. Following that, we can represent a random order of quotes by shuffling this array.
```python
                                                              
  order = list(range(len(quotes) - 1))                        
  random.shuffle(order)                                       
  context = {                                                 
    'order': order,                                           
    'quotes': quotes                                          
  }                                                           
  return context                                              
                                                              
```
&nbsp;&nbsp;&nbsp;&nbsp;The server fetches the quotes and delivers a random order to show them in. We send the list of every quote at once instead of one at a time to keep the API calls to a minimum. It's on the clientside that we iterate through our *order* array to pick which quote the user sees. Here's our React Component:
```javascript
                                                              
  export default function QuoteComponent({ url }) {           
    const [order, setOrder] = useState([]);                   
    const [quotes, setQuotes] = useState([]);                 
    const [activeQuote, setActiveQuote] = useState({          
        'i': null,                                            
        'content': null,                                      
        'author': null,                                       
    });                                                       
                                                              
    function nextQuote() {                                    
        let k = activeQuote['i'] + 1;                         
        if (k >= order.length) {                              
            // once we've exhausted the list, go back to the start
            k = 0;                                            
        }                                                     
        let pick = order[k];                                  
        let nextquote = quotes[pick];                         
        let setquote = {                                      
            'i': k,                                           
            'content': nextquote.content,                     
            'author': nextquote.author,                       
        };                                                    
        setActiveQuote(setQuote);                             
    }                                                         
    // on render, make a call to our API at /api/quotes/random/
    useEffect(() => {                                         
        let ignoreStaleRequest = false;                       
        fetch(url, { credentials: "same-origin"})             
            .then((response) => {                             
                if (!response.ok) throw Error(response.statusText);
                return response.json();                       
            })                                                
            .then((data) => {                                 
                if (!ignoreStaleRequest) {                    
                    let quoteslist = data.quotes.slice();     
                    let orderlist = data.order.slice();       
                    let initialselection = orderlist[0];      
                    let initialquote = quoteslist[initialselection];
                    let selectquote = {                       
                        'i': 0,                               
                        'content': initialquote.content,      
                        'author': initialquote.author,        
                    };                                        
                    setQuotes(quoteslist);                    
                    setOrder(orderlist);                      
                    setActiveQuote(selectedquote);            
                }                                             
            })                                                
            .catch((error) => console.log(error));            
        return () => {                                        
            ignoreStaleRequest = true;                        
        }                                                     
    }, [url]);                                                
  }                                                           
                                                              
  return (                                                    
    <>                                                        
        <div className="quote-container-outer">               
            <button id="quote-refresh">                       
                <p style={textColor}                          
                   onClick={()=> {nextQuote()}}>              
                   REFRESH                                    
                </p>                                          
            </button>                                         
            <div className="quote-content-container">         
                    <p style={textColor}><i>                  
                    "{activeQuote.content}"                   
                    </i></p>                                  
                    <p style={author}><i>                     
                    - {activeQuote.author}                    
                    </i></p>                                  
            </div>                                            
            <div id="quote-info">                             
                <p style={textColor}>                         
                QUOTES I'VE SOURCED FROM CIVILIZATION 4-6, AMONG OTHERS
                </p>                                          
            </div>                                            
        </div>                                                
    </>                                                       
  );                                                          
```
&nbsp;&nbsp;&nbsp;&nbsp;Two main things are happening here. First, on render we make a call to the API that triggers the serverside code. We take the data from that call and set our state variables: *order*, being the shuffled list of integers, *quotes*, being every quote alongside its author, and *activeQuote*, being the quote that is currently being shown to the user.&nbsp;  
&nbsp;  
&nbsp;&nbsp;&nbsp;&nbsp;Second, when the user clicks 'REFRESH', a call is made to the *nextQuote()* function, which iterates our *i* value, updating *activeQuote*. If the user has clicked through all of the quotes, *i* resets backs to 0.&nbsp;  
&nbsp;  
&nbsp;&nbsp;&nbsp;&nbsp;There are a few reasons this works well. It's relatively cheap to store every quote in a single JSON file–––mine is currently sitting at 8.1KB. While that certainly doesn't hold for, say, a million quotes, I have no intention of compiling that many in my lifetime. In one of the first iterations, I simply had the server pick a random number corresponding to a quote, but I found that for smaller values of *N* I would often see the same quote within a dozen refreshes. It was random, yes, but it didn't feel so, which is why I went with the front-loading strategy that I lay before you.&nbsp;  
&nbsp;  
&nbsp;&nbsp;&nbsp;&nbsp;If you've made it this far, I have a confession. I decided to write about the quote component, not because of its novelty, or because of the sense of delight I hope it brings to the experience, but rather how much logic it shares with most every component used in this web application. It's my way of detailing these machinations with minimal risk of revealing *too much* about things happening serverside. I take operational security very seriously, after all!&nbsp;  
&nbsp;  
While I have you, here are my 5 favorite quotes:&nbsp;  
&nbsp;  
###### "An opera begins long before the curtain goes up and ends long after it has come down. It starts in my imagination, it becomes my life, and it stays part of my life long after I've left the opera house."&nbsp;  
###### - Maria Callas&nbsp;  
&nbsp;  
###### "Once the rockets are up, who cares where they come down?" - Tom Hehrer&nbsp;  
&nbsp;  
###### "A man on a horse is spiritually as well as physically bigger than a man on foot." - John Steinbeck&nbsp;  
&nbsp;  
###### "I shot an arrow into the air. It fell to earth, I knew not where." - Henry Wasworth Longfellow&nbsp;  
&nbsp;  
###### "But as I headed into the heart of New Zealand's fjordland that same child-like feeling, long lost, of pure unadulterated awe came rushing back. I knew the road to Milford Sound was good - but this good?" - Darroch Donald&nbsp;  
&nbsp;  
&nbsp;&nbsp;&nbsp;&nbsp;I have a lot of ideas for things I'd like to write about in the future that I hope I may share. Writing is the most difficult thing, for me, but I view it as a necessary evil for which I feel great reverence towards.&nbsp;  
&nbsp;  
## Danke schön
## Andy

&nbsp;  
&nbsp;  
&nbsp;  
&nbsp;  
&nbsp;  
&nbsp;  
&nbsp;  