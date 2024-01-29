# B.T.R.A.L.

B.T.R.A.L. converts IP address Blocklists to MikroTik RouterOS Address Lists.

RouterOS unfortunately lacks the ability to import IP address blocklists, so this tool converts them to RouterOS Address List creation scripts.

For example; the following blocklist:

```txt
0.0.0.0 ; comment
1.1.1.1 # comment
2.2.2.2 // comment
// ...
```

Would be converted to the following script:

```txt
/ip firewall address-list
add address=0.0.0.0 list=your-ip-list-name
add address=1.1.1.1 list=your-ip-list-name
add address=2.2.2.2 list=your-ip-list-name
```

This script can be imported in RouterOS to add all of the addresses to an Address List.

The homepage has a form for creating a script and schedule to keep the blocklist up to date.
