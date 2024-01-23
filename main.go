package main

import (
	"net/http"
)

/*
/ip firewall address-list
add list=dlford-blocklist address=0.0.0.0
...
*/

func convertHandler(w http.ResponseWriter, r *http.Request) {
	u := r.URL.Query().Get("url")
	l := r.URL.Query().Get("listname")

	w.Write([]byte(l + ": " + u))
}

func main() {
	http.HandleFunc("/convert", convertHandler)
	http.Handle("/", http.FileServer(http.Dir("./static")))
	http.ListenAndServe(":3000", nil)
}
