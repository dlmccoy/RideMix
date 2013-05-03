//
//  TopicView.m
//  RideMix
//
//  Created by Alejandro Rodriguez on 4/22/13.
//  Copyright (c) 2013 Alejandro Rodriguez. All rights reserved.
//

#import "TopicView.h"

@implementation TopicView

- (id)initWithFrame:(CGRect)frame
{
    self = [super initWithFrame:frame];
    if (self) {
        // Initialization code
    }
    return self;
}

- (IBAction)viewArticles:(id)sender {
    if (![[UIApplication sharedApplication] openURL:self.url]) NSLog(@"%@%@",@"Failed to open url:",[self.url description]);
}

- (IBAction)viewDetails:(id)sender {
    
}

@end
