# emptyDirectoryRemover

I was having an issue with Google drive so that I found thousands of empty folders were being created. I got no response from support, and instead decide to simply remove folders that were empty. I also used it to clean up old files such as `.dropbox` and `.DS_Store` etc. for temp/cache type files I no longer use. And I wanted to move files within their folder structure to better locations. 

Caveat, this tool hs the capacity to make a real mess and loose files, be very, very careful.

1. Starting from a location path
2. Iterate through the directory tree
3. excluding (aka skip) certain locations (ie. known good that should be left alone)
4. Move matching files
5. Delete matching files
6. Process child directories (recursively)
7. recheck if directory, and if it's now empty delete it
8. log all actions taken and directories processed
9. report summary of count of all actions taken

I did run the script several times with actions commented out, I should really create command line parameters to safeguard actions (this is TBD) Would be nice to see report of what actions would be taken prior to confirming them. 
