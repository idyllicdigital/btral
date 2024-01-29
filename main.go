package main

import (
	"io"
	"net/http"
	"regexp"
	"strings"
)

var IPorCIDRregex *regexp.Regexp
var IPonlyRegex *regexp.Regexp

func GetIPorCIDRregex() *regexp.Regexp {
	if IPorCIDRregex == nil {
		numBlock := "(25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9]?[0-9])"
		subnet := "(\\/3[0-2]|\\/[1-2][0-9]|\\/[0-9])?"
		regexPattern := numBlock + "\\." + numBlock + "\\." + numBlock + "\\." + numBlock + subnet
		IPorCIDRregex = regexp.MustCompile(regexPattern)
	}
	return IPorCIDRregex
}

func GetIPonlyRegex() *regexp.Regexp {
	if IPonlyRegex == nil {
		numBlock := "(25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9]?[0-9])"
		regexPattern := numBlock + "\\." + numBlock + "\\." + numBlock + "\\." + numBlock
		IPonlyRegex = regexp.MustCompile(regexPattern)
	}
	return IPonlyRegex
}

func convertHandler(w http.ResponseWriter, r *http.Request) {
	u := r.URL.Query().Get("url")
	l := r.URL.Query().Get("listname")

	res, err := http.Get(u)
	if err != nil {
		w.Write([]byte(""))
		return
	}
	defer res.Body.Close()

	if res.StatusCode != 200 {
		w.Write([]byte(""))
		return
	}

	data, err := io.ReadAll(res.Body)
	if err != nil {
		w.Write([]byte(""))
		return
	}

	var ips []string

	// TODO: Test subnets
	for _, line := range strings.Split(string(data), "\n") {
		ip := line
		ip = strings.Split(line, "#")[0]
		ip = strings.Split(ip, "//")[0]
		ip = strings.Split(ip, ";")[0]
		ip = strings.Split(ip, "	")[0]
		ip = strings.Split(ip, " ")[0]
		ip = strings.TrimSpace(ip)

		matcher := GetIPorCIDRregex()
		match := matcher.FindString(ip)
		if match != "" {
			ips = append(ips, ip)
		}
	}

	w.Header().Set("Content-Type", "text/plain")
	w.Write([]byte("/ip firewall address-list\nadd list=" + l + " address=" + strings.Join(ips, "\nadd list="+l+" address=")))
}

func main() {
	http.HandleFunc("/convert", convertHandler)
	http.Handle("/", http.FileServer(http.Dir("./static")))
	http.ListenAndServe(":3000", nil)
}
