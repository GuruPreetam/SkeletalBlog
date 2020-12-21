# SkeletalBlog
Skeletal Framework for a blog like website with minimal focus on aesthetics and more on functionality.

MODULES USED:
uuid - for unique identifier key generation
express
node-fetch: used to run fetch in server side.

KNOWN ISSUES:
[1]. Data doesnt change dynamically after Edit title/content. User will need to log out and login to see changes.
[2]. The url does not update as you move between functionalities and pages. To check bookmarkable links requirement - refer NOTE:[1]

NOTE:
[1]. To check bookmarkable links before logging in - try 
	http://localhost:3000/viewNews_guest for guest
	http://localhost:3000/viewNews_author for author
	http://localhost:3000/viewNews_subscriber for subscriber
[http://localhost:3000/viewNews_guest,... are the endpoint URLs that are used in the fetch call]

[2]. fetch has been used for all calls.
	Functionalities for which fetch was used:
	[a] When you login.
	[b] To view indiviual sotry via hyperlink.
	[c] To Create/Delete Story in Author
	[d] To edit Title/Content of a Story in Author.
	[e] To logout from user viewNews page
	[f] To cancel story creation in create Story Form.
	[g] To cancel story creation in edit Title/Content from a Story Form.
	[h] Retrieve data from persistencedata.json to display in ViewNews..
