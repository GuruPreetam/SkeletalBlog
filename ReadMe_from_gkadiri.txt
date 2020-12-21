MODULES USED:
uuid - for unique identifier key generation
express
node-fetch: used to run fetch in server side.

KNOWN ISSUES:
[1]. Data doesnt change dynamically after Edit title/content. User will need to log out and login to show changes for EC1.

[2]. The url does not update as you move between functionalities and pages. To check bookmarkable links requirement - refer NOTE:[1]

EXTRA CREDITS:
EC1 is completed
	The form to edit title or content appears at bottom of the page.

NOTE:
[1]. To check bookmarkable links before logging in - try 
	http://localhost:3000/viewNews_guest for guest
	http://localhost:3000/viewNews_author for author
	http://localhost:3000/viewNews_subscriber for subscriber
[http://localhost:3000/viewNews_guest,... are the endpoint URLs that are used in the fetch call]

[2]. For part1, the files given to us have been used.

[3]. fetch has been used for all calls.
	Functionalities for which fetch was used:
	[a] When you login.
	[b] To view indiviual sotry via hyperlink.
	[c] To Create/Delete Story in Author
	[d] To edit Title/Content of a Story in Author. {EC1}
	[e] To logout from user viewNews page
	[f] To cancel story creation in create Story Form.
	[g] To cancel story creation in edit Title/Content from a Story Form.
	[h] Retrieve data from persistencedata.json to display in ViewNews.

[4]. Activity-1 Test Cases are in gkadiri_Activity1TestCases.postman_collection.json

[5]. Other than files given to us, only NewServiceAPI.js (containing activity2) and login.html(a html form taken into NewServiceAPI.js for server side rendering are used.